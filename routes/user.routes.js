module.exports = app => {
    const UserController = require('../controllers/user.controller.js')

    app.route('/trax/api/users')
        .get(UserController.getAll)

    app.route('/trax/api/users/:userId')
        .get(UserController.findById)
        .delete(UserController.delete)

    // app.route('/trax/api/user/email/:userEmail')
    //     .get(UserController.findByEmail)
}
