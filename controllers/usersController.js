const User = require('../model/User');

exports.register = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).render('register', { error: 'All fields are required.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).render('register', { error: 'Passwords do not match.' });
    }
  
    try {
      const user = await User.register(username, email, password);
      if (!user) {
        return res.status(400).render('register', { error: 'Username already exists.' });
      }
        req.session.user = { username, email };
        res.redirect('/main');
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).render('register', { error: 'Internal Server Error.' });
    }
}

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.login(username, password);
    if (!user) {
      return res.render('login', { error: 'Invalid username or password.' });
    }
    req.session.user = user;
    // res.json({ message: "Login successful", user });
    res.redirect('/main');
}