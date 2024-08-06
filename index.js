require('dotenv').config();
const { Bot, GrammyError, HttpError, InlineKeyboard } = require('grammy');
const { hydrate } = require('@grammyjs/hydrate');
const config = require('./config.js');
const sqlite3 = require('sqlite3');

const bot = new Bot(process.env.BOT_API_TOKEN);

let db = new sqlite3.Database('beauty_salon.db', (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('DataBase connected...');
    }
});

// db.run(`CREATE TABLE IF NOT EXISTS services (ID INTEGER PRIMARY KEY, service TEXT)`);
// db.run(`CREATE TABLE IF NOT EXISTS masters (ID INTEGER PRIMARY KEY, master TEXT)`);
// db.run(`CREATE TABLE IF NOT EXISTS orders (ID INTEGER PRIMARY KEY, userId TEXT, service TEXT, master TEXT, phone TEXT, orderStatus TEXT)`);
// db.run(`DROP TABLE services`);
// db.run(`DROP TABLE masters`);
// db.run(`INSERT INTO services VALUES (NULL, "Окрашивания")`);

// db.run(`INSERT INTO masters VALUES (NULL, "Мария Дорожкина; Стрижки - 4000р, Укладки - от 3500, Окрашивания - от 8200р, Уходы для волос - от 5000р; https://downloader.disk.yandex.ru/preview/d52799b97876c882422704bb4836fb3238be429c5c511f51e6481cad65daf217/66ae5591/6tMSAHoG3fwVeqE7GqkuFRN1Lb9I7e4sgKep_l3rlODGamKT1RXlO-3z0UDNhj9rk2YqOpvBR0akW2GFDCpnTQ%3D%3D?uid=0&filename=5.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=1600x760, https://downloader.disk.yandex.ru/preview/a3412581cd8c97f0e508e1784b90c8c19d2b430427217ea2a1ea983d647d7dcf/66ae5591/8cU86-rLJ9KJ626iB4KlkCwtQhzTh1IiS5Std4R66L5IVcsR5gzGPt_byhz0PPaMT4GyONqG7qd-o0f8bxHRKg%3D%3D?uid=0&filename=IMG_6335.JPG&disposition=inline&hash=&limit=0&content_type=image%2Fjpeg&owner_uid=0&tknv=v2&size=1600x760, https://downloader.disk.yandex.ru/preview/8222a8ed2bc6135c0df8e74218fc4398424bcfb74a9ac0195658ce284fa191ab/66ae5591/MJOHsr9bep0R4GRwdbWqMnBASuEGvglJJjoJf4Si-1PZXX6NE2ckfYgpFfX5ffHlcOiBZ0ko92ybldTlSbGCJQ%3D%3D?uid=0&filename=IMG_7111.JPG&disposition=inline&hash=&limit=0&content_type=image%2Fjpeg&owner_uid=0&tknv=v2&size=1600x760")`);

// db.run(`INSERT INTO masters VALUES (NULL, "Мария Дорожкина; Стрижки - 4000р, Укладки - от 3500, Окрашивания - от 8200р, Уходы для волос - от 5000р; https://downloader.disk.yandex.ru/preview/d52799b97876c882422704bb4836fb3238be429c5c511f51e6481cad65daf217/66ae5591/6tMSAHoG3fwVeqE7GqkuFRN1Lb9I7e4sgKep_l3rlODGamKT1RXlO-3z0UDNhj9rk2YqOpvBR0akW2GFDCpnTQ%3D%3D?uid=0&filename=5.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=1600x760, https://downloader.disk.yandex.ru/preview/a3412581cd8c97f0e508e1784b90c8c19d2b430427217ea2a1ea983d647d7dcf/66ae5591/8cU86-rLJ9KJ626iB4KlkCwtQhzTh1IiS5Std4R66L5IVcsR5gzGPt_byhz0PPaMT4GyONqG7qd-o0f8bxHRKg%3D%3D?uid=0&filename=IMG_6335.JPG&disposition=inline&hash=&limit=0&content_type=image%2Fjpeg&owner_uid=0&tknv=v2&size=1600x760, https://downloader.disk.yandex.ru/preview/8222a8ed2bc6135c0df8e74218fc4398424bcfb74a9ac0195658ce284fa191ab/66ae5591/MJOHsr9bep0R4GRwdbWqMnBASuEGvglJJjoJf4Si-1PZXX6NE2ckfYgpFfX5ffHlcOiBZ0ko92ybldTlSbGCJQ%3D%3D?uid=0&filename=IMG_7111.JPG&disposition=inline&hash=&limit=0&content_type=image%2Fjpeg&owner_uid=0&tknv=v2&size=1600x760")`);

db.close((err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('DataBase disabled...');
    } 
});

bot.use(hydrate());

bot.api.setMyCommands([
    {command: 'start', description: 'Запустить бота'},
    {command: 'services', description: 'Выбрать услугу'},
    {command: 'help', description: 'Список команд бота'},
    {command: 'add_master', description: 'Добавить нового мастера'},
    {command: 'add_service', description: 'Добавить новую услугу'}
]);

bot.command('start', async (ctx) => {
    config.addUserToOrders(ctx, db, sqlite3);

    let photoCaption = `Лаборатория стиля Персона LAB Маяковская работает для своих клиентов вот уже более 15 лет и хорошо известна в Москве своей безупречной репутацией.

Безопасность, профессионализм, опыт нескольких поколений в сочетании с новыми тенденциями и ПЕРСОНАльный подход к каждому клиенту обеспечили салону лидерские позиции в индустрии красоты, которые укрепляются с каждым годом.

Для записи на прием воспользуйтесь командой \/services.`;

    await ctx.api.sendPhoto(ctx.msg.chat.id, 'https://cloud.mail.ru/public/UVA6/L3KJbwwwq', {
        caption: photoCaption
    });
});

bot.command('services', async (ctx) => {
    config.replyWithServicesKeyboard(ctx, db, sqlite3);
});

bot.command('add_master', async (ctx) => {
    config.sendRulesForAddMaster(ctx);
});

bot.command('add_service', async (ctx) => {
    config.sendRulesForAddService(ctx);
});

bot.command('delete_master', async (ctx) => {
    config.sendRulesForDeleteMaster(ctx);
});

bot.command('delete_service', async (ctx) => {
    config.sendRulesForDeleteService(ctx);
});

bot.command('help', async (ctx) => {
    await ctx.reply(`Команды бота: 
    \/start - Запустить бота,
    \/services - Выбрать услугу,
    \/add_master - Добавить нового мастера (Для админа),
    \/add_service - Добавить новую услугу (Для админа).`);
});

bot.callbackQuery(/service-[1-9]/, async (ctx) => {
    config.replyWithMastersKeyboard(ctx, db, sqlite3);
});

bot.callbackQuery('back-to-services', async (ctx) => {
    config.backToServicesKeyboard(ctx, db, sqlite3);
});

bot.callbackQuery(/master-[1-9]/, async (ctx) => {
    config.replyWithMasterDetailsKeyboard(ctx, db, sqlite3);
});

bot.callbackQuery('back-to-masters', async (ctx) => {
    config.backToMastersKeyboard(ctx, db, sqlite3);
});

bot.callbackQuery('send-request', async (ctx) => {
    config.requestContact(ctx);
});

bot.callbackQuery(/portfolio-[1-9]/, async (ctx) => {
    config.sendMasterPortfolio(ctx, db, sqlite3);
});

bot.callbackQuery('back-to-master-details', async (ctx) => {
    config.backToMasterDetailsKeyboard(ctx, db, sqlite3);
});

bot.on(':text', async (ctx) => {
    if ((ctx.msg.text.includes('+7') || ctx.msg.text.includes('8')) && ctx.msg.from.id !== Number(process.env.ADMIN_ID)) {
        config.saveUserContact(ctx, db, sqlite3);
    } else if (ctx.msg.from.id === Number(process.env.ADMIN_ID) && ctx.msg.text.includes('add_master')) {
        config.addMaster(ctx, db, sqlite3);
    } else if (ctx.msg.from.id === Number(process.env.ADMIN_ID) && ctx.msg.text.includes('add_service')) {
        config.addService(ctx, db, sqlite3);
    } else if (ctx.msg.from.id === Number(process.env.ADMIN_ID) && ctx.msg.text.includes('delete_master')) {
        config.deleteMaster(ctx, db, sqlite3);
    } else if (ctx.msg.from.id === Number(process.env.ADMIN_ID) && ctx.msg.text.includes('delete_service')) {
        config.deleteService(ctx, db, sqlite3);
    }  
    
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error('Error in request:', e.description);
    } else if (e instanceof HttpError) {
        console.error('Could not contact Telegram:', e);
    } else {
        console.error('Unknown error:', e);
    }
});


bot.start();