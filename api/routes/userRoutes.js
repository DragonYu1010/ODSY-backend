'use strict'
module.exports = function(app) {
    var controller = require('../controllers/userController')

    app.route('/user/:wallet')
        .put(controller.updateUser)
        .get(controller.getUserInfo)
}