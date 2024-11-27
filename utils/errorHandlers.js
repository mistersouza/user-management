const handleUserNotFound = (response, message) => {
    response.status(404).render('usernotfound', { message: message || "User's gone MIA! Let's get you back on track." });
};

module.exports = { handleUserNotFound };
