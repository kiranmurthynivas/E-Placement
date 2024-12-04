module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        return res.redirect("/mentor/login");  // Redirect to student login if neither is logged in
    }
    next();
};
