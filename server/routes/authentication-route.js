const router = require('express').Router();
const auth = require('../middlewares/auth-middleware');
const User = require('../controllers/user-controller');
const Joi = require('joi');
var sendmail = require('../controllers/send-mail-controller');
const jwt = require('jsonwebtoken');

// route for user sign up
router.post('/sign_up', async (req, res) => {

    try {
        // set Joi validation schema to check correctness of data
        const shcema = Joi.object().keys({
            email: Joi.string().trim().email().required(),
            password: Joi.string().required(),
            birthday: Joi.date().raw().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            bio: Joi.string().optional()
        });

        Joi.validate(req.body, shcema, async (err, result) => {
            if (err) return res.status(500).json({ error: err });
            if (await User.checkMAilExistAndFormat(req.body.email))
                return res.status(403).json({ message: 'Mail exists' });
            var token = jwt.sign({
                email: req.body.email,
                password: req.body.birthday,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                birthday: req.body.birthday,
                bio: req.body.bio
            }, process.env.jwtsecret, { expiresIn: '904380934853454h' });
            console.log(token);
            if (await sendmail(req.body.email, String(token), 'confirm'))
                return res.status(204).json({ success: 'sign up done ' })
            else return res.status(400);
        });
    } catch (ex) {
        res.status(400).send({ 'error': 'error in making the request' });
    }
});

router.post('/sign_up/confirm', auth, async (req, res) => {
    const shcema = Joi.object().keys({
        email: Joi.string().trim().email().required(),
        password: Joi.string().required(),
        birthday: Joi.date().raw().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        bio: Joi.string().optional(),
        iat: Joi.required(),
        exp: Joi.required()
    });

    Joi.validate(req.user, shcema, async (err, result) => {
        if (err) {
            // if not valid set status to 500
            res.status(500).json({
                error: err
            })
        } else {
            user = await User.createUser(req.user)
            if (!user) return res.status(400).json({ error: 'there is error !' });
            return res.status(204).json({ success: 'confirm done' })
        }
    })
})

router.post('/login', async (req, res) => {
    const shcema = Joi.object().keys({
        email: Joi.string().trim().email().required(),
        password: Joi.string().required()
    });

    Joi.validate(req.body, shcema, async (err, result) => {
        if (err) return res.status(500).json({ error: err })
        const user = await User.checkEmailAndPass(req.body.email, req.body.password);
        if (!user) return res.status(403).json({ error: 'not user by this email ' });
        if (user == -1) return res.status(403).json({ error: ' password is not correct' });
        const token = jwt.sign({ _id: user._id }, process.env.jwtsecret, { expiresIn: '904380934853454h' });
        res.json({ token: token });
    })
})
module.exports = router;