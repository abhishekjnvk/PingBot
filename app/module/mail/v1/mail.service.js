const BaseService = require('../../../base/base_service');
const nodemailer = require("nodemailer");
const { app_config } = require('../../../config');


class MailServiceV1 extends BaseService {
    constructor(opts) {
        super(opts, 'MailLogs');
        this.usersModalName = 'Users';
        this.transporter = nodemailer.createTransport({
            host: this.config.app_config.SMTP_HOST,
            port: this.config.app_config.SMTP_PORT,
            secure: this.config.app_config.SMTP_SECURE,
            auth: {
                user: this.config.app_config.SMTP_USER,
                pass: this.config.app_config.SMTP_PASS,
            },
        });
    }

    async SenErrorMail(website, status) {
        try {
            if (!this.cache.get(`reminder_${website._id}`)) {
                var user = await this.get(website.user_id, this.usersModalName);
                var text_body = `Hello ${user.name},\n It seems you website labeled as ${website.name} (${website.url}) facing some issue status code ${status}. Please Have a look at this\n\nThis is a system generated email`;
                var html_body = `Hello ${user.name},<br>It seems you website labeled as ${website.name} <a href="${website.url}">(${website.url})</a> facing some issue status code <b>${status}</b>. Please Have a look at this<br><br><center><small>This is a system generated email</small><center>`;
                var subject = `Error ${status} in ${website.name}`;
                this.cache.put(`mail_in_process_${website._id}`, 1, 21600000); //6 Hrs
                setTimeout(() => {
                    if (this.cache.get(`mail_in_process_${website._id}`)) {
                        this.sendMail(
                            subject,
                            text_body,
                            user.email,
                            user._id,
                            website._id,
                            html_body,

                        );
                        this.cache.put(`reminder_${website._id}`, 1, 21600000); //6 Hrs
                    }
                }, website.email_time * 1000);
            }
        }
        catch (e) {
            this.logger.error(e.message + ": error in sending mail");
        }
    }


    async SendSuccessMessage(website, status) {
        var user = await this.get(website.user_id, this.usersModalName);
        var subject = `Error Resolved in ${website.name}`;
        var text_body = `Hello ${user.name},\n This is a gentle reminder that your website labeled as ${website.name} (${website.url}) is fine now. Status Code ${status}`;
        var html_body = `Hello ${user.name},<br>This is a gentle reminder that your website labeled as ${website.name} <a href="${website.url}">(${website.url})</a> is fine now. Status Code <b>${status}</b><br><br><center><small>This is a system generated email</small><center>`;
        this.sendMail(subject, text_body, user.email, user._id, website._id, html_body);
        this.cache.del(`reminder_${website._id}`, 1);
    }


    async sendMail(
        subject,
        text_body,
        email,
        user_id,
        website_id,
        html_body = "",
    ) {
        try {
            var data = await this.transporter.sendMail({
                from: `"PingBot " <${app_config.SMTP_USER}>`,
                to: email,
                subject: subject,
                text: text_body,
                html: html_body,
            });
            var mail_log = {
                user_id,
                email,
                subject,
                website_id,
                message_id: data.messageId,
                message: text_body,
            }
            this.create(mail_log)
        }
        catch (e) {
            this.logger.error(e.message + " : Error in sending mail");
        }
    }
}

module.exports = MailServiceV1;
