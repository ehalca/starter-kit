import { registerAs } from "@nestjs/config";

const KEY = 'mail';

const loader = ()=>({
    transport:{
        host: process.env['MAIL_HOST'],
        port: process.env['MAIL_PORT'],
        replyTo: process.env['MAIL_REPLY_TO'],
        secure: process.env['MAIL_SECURE'],
        auth:{
            user: process.env['MAIL_USERNAME'],
            pass: process.env['MAIL_PASSWORD']
        }
    },
    defaults:{
        from: `"${process.env['MAIL_FROM_NAME']}" <${process.env['MAIL_FROM_ADDRESS']}>`
    },
    disabled: process.env['MAIL_DISABLED'] === 'true',
    testSender: process.env['MAIL_TEST_SENDER'],
})

export type MailVariables = {
    [KEY]: ReturnType<typeof loader>
}

export default registerAs(KEY, loader);