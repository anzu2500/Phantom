import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { board } from '../types/board';
import { user } from '../types/user';
import { ValidationService } from '../shared/validation.service';
import { pin } from '../types/pin';
import * as search from 'fuzzy-search';
@Injectable()
export class SearchService {
  constructor(
    @InjectModel('Board') private readonly boardModel: Model<board>,
    @InjectModel('Pin') private readonly pinModel: Model<pin>,
    @InjectModel('User') private readonly userModel: Model<user>,
    private ValidationService: ValidationService,
  ) {}
  async Fuzzy(model, params, name, limit: number, offset: number) {
    const searcher = new search(model, params, {
      caseSensitive: false,
      sort: true,
    });
    let result = searcher.search(name);
    let limitOffsetResult = this.ValidationService.limitOffset(
      limit,
      offset,
      result,
    );
    return { result: limitOffsetResult, length: limitOffsetResult.length };
  }
  async getAllPins(name, limit, offset) {
    let pin = await this.pinModel.find({}, 'title note imageId').lean();
    return await this.Fuzzy(pin, ['title', 'note'], name, limit, offset);
  }
  async getMyPins(name, userId, limit, offset) {
    if (!(await this.ValidationService.checkMongooseID([userId])))
      throw new Error('not mongoose id');
    let pin = await this.pinModel
      .find({ 'creator.id': Types.ObjectId(userId) }, 'title note imageId')
      .lean();
    return await this.Fuzzy(pin, ['title', 'note'], name, limit, offset);
  }
  async addToRecentSearch(userId, name) {
    let user = await this.userModel.findByIdAndUpdate(userId, {
      $pull: { recentSearch: name },
    });
    if (user.recentSearch.length >= 5) {
      user.recentSearch = user.recentSearch.slice(0, 4);
      await user.save();
    }
    return await this.userModel
      .findByIdAndUpdate(userId, { $push: { recentSearch: name } })
      .lean();
  }
  async getPeople(name, limit, offset) {
    let user = await this.userModel.aggregate([
      { $match: {} },
      {
        $project: {
          boards: { $size: '$boards' },
          followers: { $size: '$followers' },
          profileImage: 1,
          userName: 1,
          lastName: 1,
          firstName: 1,
          google: 1,
          googleImage: 1,
        },
      },
    ]);
    return await this.Fuzzy(
      user,
      ['firstName', 'lastName', 'userName'],
      name,
      limit,
      offset,
    );
  }
  async getKeys(name: string) {
    await this.userModel.syncIndexes();
    let keysPin = await this.pinModel
      .aggregate([
        {
          $addFields: {
            results: { $regexMatch: { input: '$category', regex: /f/ } },
          },
        },
      ])
      .limit(5);
    if (keysPin.length > 0)
      return keysPin.map(pin => {
        return { name: pin.title };
      });
    let keysBoard = await this.boardModel
      .find(
        {
          $text: { $search: name },
        },
        { name: 1, _id: 0 },
      )
      .limit(5)
      .lean();
    if (keysBoard.length > 0) return keysBoard;
    let KeysPeople = [];
    return KeysPeople;
  }
  async getRecentSearch(userId) {
    let user = await this.userModel.findById(userId, 'recentSearch');
    if (!user.recentSearch) {
      user.recentSearch = [];
    }
    return { recentSearch: user.recentSearch };
  }
  async getBoards(name, limit, offset) {
    let board = await this.boardModel.aggregate([
      { $match: {} },
      {
        $project: {
          pins: 1,
          sections: { $size: '$sections' },
          coverImages: 1,
          topic: 1,
          description: 1,
          name: 1,
          creator: 1,
        },
      },
    ]);

    let res = await this.Fuzzy(
      board,
      ['name', 'description', 'topic'],
      name,
      limit,
      offset,
    );
    for (let i = 0; i < res.result.length; i++) {
      let creator = await this.userModel.findById(res.result[i].creator.id, {
        email: 1,
      });
      if (creator) {
        if (String(creator.email) == String(process.env.ADMIN_EMAIL)) {
          res.result.splice(i, 1);
          res.length--;
        }
      }
      res.result[i].coverImages = [];
      for (let c = 0; c < 3; c++) {
        if (c < res.result[i].pins.length) {
          let coverPin = await this.pinModel.findById(
            res.result[i].pins[c].pinId,
            {
              imageId: 1,
            },
          );
          res.result[i].coverImages.push(coverPin.imageId);
        }
      }
    }
    return res;
  }
}
