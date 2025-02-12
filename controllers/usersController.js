const User = require('../model/User');

exports.register = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).render('register', { error: 'All fields are required.' });
        }
        if (password !== confirmPassword) {
            return res.status(400).render('register', { error: 'Passwords do not match.' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).render('register', { error: 'Username already exists.' });
        }

        
        const newUser = new User({ username, email, password });
        await newUser.save();

        req.session.user = { username, email };
        res.redirect('/main');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).render('register', { error: 'Internal Server Error.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || user.password !== password) {
            return res.render('login', { error: 'Invalid username or password.' });
        }

        req.session.user = { username: user.username, email: user.email };
        res.redirect('/main');
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).render('login', { error: 'Internal Server Error.' });
    }
};