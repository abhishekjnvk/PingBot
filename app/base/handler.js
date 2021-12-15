
let service_locator = require('../helpers/service_locator');
let logger = service_locator.get('logger');
//Handle All Errors
module.exports = function (app) {

    //wait for all routes to be registered
    setTimeout(() => {

        app.use(function (err, req, res, next) {
            let details;
            if (err.message === 'Validation failed') {
                err.statusCode = 400;
                const { details: [errorDetails] } = err;
                details=errorDetails;
                logger.debug("VALIDATION_ERROR", errorDetails);
            }
            logger.error(err);
            res.status(err.statusCode || 500).send({ error: err.message,details });
        });

        //handle 404 Erorrs
        app.all("*", function (req, res) {
            //request type
            let requestType = req.method;
            res.status(404).send({
                message: 'Page Not Found',
            });
            logger.error(requestType+" "+req.originalUrl + ' Page Not Found ');
        });

    }, 200);

}
