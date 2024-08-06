const { InlineKeyboard } = require('grammy');

module.exports = {
    addUserToOrders(ctx, db, sqlite3) {
        let checkUserExist = new Promise((resolve, reject) => {
            db = new sqlite3.Database('beauty_salon.db', (err) => {
                if (err) {
                    console.error(err);
                }
            });
    
            db.serialize(() => {
                db.get(`SELECT userId FROM orders WHERE userId="${ctx.msg.from.id}"`, [], (err, id) => {
                    resolve(id);
                });
            });
    
            db.close((err) => {
                if (err) {
                    console.error(err);
                } 
            });
        });

        checkUserExist.then(id => {
            if (!id) {
                db = new sqlite3.Database('beauty_salon.db', (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
        
                db.serialize(() => {
                    db.run(`INSERT INTO orders VALUES (NULL, "${ctx.msg.from.id}", "empty", "empty", "empty", "created")`, [], (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                });
        
                db.close((err) => {
                    if (err) {
                        console.error(err);
                    } 
                });
            }
        });
    },
    replyWithServicesKeyboard(ctx, db, sqlite3) {
        db = new sqlite3.Database('beauty_salon.db', (err) => {
            if (err) {
                console.error(err);
            }
        });

        db.serialize(() => {
            db.run(`UPDATE orders SET service="empty", master="empty", phone="empty", orderStatus="created" WHERE userId="${ctx.msg.from.id}"`);
        });

        let getServicesFromServices = new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`SELECT ID, service FROM services`, [], (err, services) => {
                    const servicesKeyboard = new InlineKeyboard();
                    services.forEach(serviceButton => {
                        servicesKeyboard.add({text: `${serviceButton.service}`, callback_data: `service-${serviceButton.ID}`}).row();
                        resolve(servicesKeyboard);
                    });
                });
            });
        });

        getServicesFromServices.then(servicesKeyboard => {
            ctx.reply('Выберите одну из наших услуг.', {
                reply_markup: servicesKeyboard
            });
        });

        db.close((err) => {
            if (err) {
                console.error(err);
            } 
        });
    },
    replyWithMastersKeyboard(ctx, db, sqlite3) {
        db = new sqlite3.Database('beauty_salon.db', (err) => {
            if (err) {
                console.error(err);
            }
        });

        db.serialize(() => {
            db.run(`UPDATE orders SET service="${ctx.callbackQuery.data}" WHERE userId="${ctx.from.id}"`);
        });

        let getServiceName = new Promise((resolve, reject) => {
            const serviceNumber = ctx.callbackQuery.data.slice(-1);

            db.get(`SELECT service FROM services WHERE ID=${serviceNumber} `, [], (err, row) => {
                resolve(row.service);
            });
        });

        let getMasters = new Promise((resolve, reject) => {
            db.all(`SELECT master FROM masters `, [], (err, row) => {
                resolve(row);
            });
        });

        getServiceName.then(serviceName => {
            getMasters.then(mastersArray => {
                const mastersKeyboard = new InlineKeyboard();
                let currentService;
                mastersArray.forEach((master, i) => {
                    if (master.master.includes(serviceName)) {
                        master.master.split('; ')[1].split(', ').forEach(service => {
                            if (service.includes(serviceName)) {
                                currentService = service;
                            }
                        });
                        mastersKeyboard.add({text: `${master.master.split('; ')[0]}`, callback_data: `master-${i + 1}`}).row();
                    }
                });

                mastersKeyboard.add({text: '< Назад', callback_data: 'back-to-services'});

                return mastersKeyboard;
            }).then(mastersKeyboard => {
                ctx.callbackQuery.message.editText('Выберите одного из наших мастеров', {
                    reply_markup: mastersKeyboard
                })
            });
        });

        db.close((err) => {
            if (err) {
                console.error(err);
            } 
        });
    },
    backToServicesKeyboard(ctx, db, sqlite3) {
        db = new sqlite3.Database('beauty_salon.db', (err) => {
            if (err) {
                console.error(err);
            }
        });

        db.serialize(() => {
            db.run(`UPDATE orders SET service="empty", master="empty", phone="empty", orderStatus="created" WHERE userId="${ctx.from.id}"`);
        });

        let getServicesFromServices = new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all(`SELECT ID, service FROM services`, [], (err, services) => {
                    const servicesKeyboard = new InlineKeyboard();
                    services.forEach(serviceButton => {
                        servicesKeyboard.add({text: `${serviceButton.service}`, callback_data: `service-${serviceButton.ID}`}).row();
                        resolve(servicesKeyboard);
                    });
                });
            });
        });

        getServicesFromServices.then(servicesKeyboard => {
            ctx.callbackQuery.message.editText('Выберите одну из наших услуг.', {
                reply_markup: servicesKeyboard
            });
        });

        db.close((err) => {
            if (err) {
                console.error(err);
            } 
        });
    },
    replyWithMasterDetailsKeyboard(ctx, db, sqlite3) {
        db = new sqlite3.Database('beauty_salon.db', (err) => {
            if (err) {
                console.error(err);
            }
        });

        let getMasterName = new Promise((resolve, reject) => {
            const masterNumber = ctx.callbackQuery.data.slice(-1);

            db.get(`SELECT master FROM masters WHERE ID=${masterNumber} `, [], (err, row) => {
                resolve(row.master);
            });
        });

        let getServiceNameFromOrders = new Promise((resolve, reject) => {
            db.get(`SELECT service FROM orders WHERE userId=${ctx.from.id} `, [], (err, row) => {
                resolve(row.service);
            });
        });

        getMasterName.then(master => {
            let masterName = master.split('; ')[0];
            let serviceNameAndPrice;

            getServiceNameFromOrders.then(serviceName => {
                let getServiceNameFromServices = new Promise((resolve, reject) => {
                    let serviceNumberForPromise = Number(serviceName.slice(-1));

                    db = new sqlite3.Database('beauty_salon.db', (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });

                    db.get(`SELECT service FROM services WHERE ID="${serviceNumberForPromise}" `, [], (err, row) => {
                        resolve(row?.service);
                    });

                    db.close((err) => {
                        if (err) {
                            console.error(err);
                        } 
                    });
                });

                getServiceNameFromServices.then(correctService => {
                    master.split('; ')[1].split(', ').forEach(currentService => {
                        if (currentService.includes(correctService)) {
                            serviceNameAndPrice = currentService;
                        }
                    });
    
                    db = new sqlite3.Database('beauty_salon.db', (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
    
                    db.run(`UPDATE orders SET service="${serviceNameAndPrice}", master="${masterName}" WHERE userId="${ctx.from.id}"`);
    
                    db.close((err) => {
                        if (err) {
                            console.error(err);
                        } 
                    });
    
                    const masterDetailsKeyboard = new InlineKeyboard()
                    .text('Отправить заявку на прием', 'send-request').row()
                    .text('Посмотреть портфолио мастера', `portfolio-${ctx.callbackQuery.data.slice(-1)}`).row()
                    .text('< Назад', 'back-to-masters');
    
                    ctx.callbackQuery.message.editText(`${masterName}, ${serviceNameAndPrice}`, {
                        reply_markup: masterDetailsKeyboard
                    });
                });
            });
        });

        db.close((err) => {
            if (err) {
                console.error(err);
            } 
        });
    },
    backToMastersKeyboard(ctx, db, sqlite3) {
        db = new sqlite3.Database('beauty_salon.db', (err) => {
            if (err) {
                console.error(err);
            }
        });

        let getServiceNameFromOrders = new Promise((resolve, reject) => {
            db.get(`SELECT service FROM orders WHERE userId=${ctx.from.id} `, [], (err, row) => {
                let userService = row?.service.split(' - ')[0];
                resolve(userService);
            });
        });

        getServiceNameFromOrders.then(userService => {
            let getServiceCallbackDataFromServices = new Promise((resolve, reject) => {
                db = new sqlite3.Database('beauty_salon.db', (err) => {
                    if (err) {
                        console.error(err);
                    }
                });

                db.get(`SELECT * FROM services WHERE service="${userService}" `, [], (err, row) => {
                    resolve(row.ID);
                });

                db.close((err) => {
                    if (err) {
                        console.error(err);
                    } 
                });
            });

            getServiceCallbackDataFromServices.then(serviceId => {
                db = new sqlite3.Database('beauty_salon.db', (err) => {
                    if (err) {
                        console.error(err);
                    }
                });

                db.run(`UPDATE orders SET service="service-${serviceId}", master="empty" WHERE userId="${ctx.from.id}"`);

                db.close((err) => {
                    if (err) {
                        console.error(err);
                    } 
                });

                let getServiceNameFromServices = new Promise((resolve, reject) => {
                    db = new sqlite3.Database('beauty_salon.db', (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
            
                    db.get(`SELECT service FROM services WHERE ID=${serviceId} `, [], (err, row) => {
                        resolve(row?.service);
                    });
    
                    db.close((err) => {
                        if (err) {
                            console.error(err);
                        } 
                    });
                });
    
                getServiceNameFromServices.then(serviceName => {
                    let getMasters = new Promise((resolve, reject) => {
                        db = new sqlite3.Database('beauty_salon.db', (err) => {
                            if (err) {
                                console.error(err);
                            }
                        });

                        db.all(`SELECT master FROM masters `, [], (err, row) => {
                            resolve(row);
                        });

                        db.close((err) => {
                            if (err) {
                                console.error(err);
                            } 
                        });
                    });

                    getMasters.then(mastersArray => {
                        const mastersKeyboard = new InlineKeyboard();
                        let currentService;
                        mastersArray.forEach((master, i) => {
                            if (master.master.includes(serviceName)) {
                                master.master.split('; ')[1].split(', ').forEach(service => {
                                    if (service.includes(serviceName)) {
                                        currentService = service;
                                    }
                                });
                                mastersKeyboard.add({text: `${master.master.split('; ')[0]}`, callback_data: `master-${i + 1}`}).row();
                            }
                        });
        
                        mastersKeyboard.add({text: '< Назад', callback_data: 'back-to-services'});
        
                        return mastersKeyboard;
                    }).then(mastersKeyboard => {
                        ctx.callbackQuery.message.editText('Выберите одного из наших мастеров', {
                            reply_markup: mastersKeyboard
                        })
                    });
                });
            });
        });

        // let getServiceCallbackDataFromOrders = new Promise((resolve, reject) => {
        //     db.get(`SELECT service FROM orders WHERE userId=${ctx.from.id} `, [], (err, row) => {
        //         resolve(row?.serviceCallbackData);
        //     });
        // });

        // let getMasters = new Promise((resolve, reject) => {
        //     db.all(`SELECT master FROM masters `, [], (err, row) => {
        //         resolve(row);
        //     });
        // });

        // getServiceCallbackDataFromOrders.then(serviceCallbackData => {
            

            // getMasters.then(mastersArray => {
            //     const mastersKeyboard = new InlineKeyboard();
            //     let currentService;
            //     mastersArray.forEach((master, i) => {
            //         if (master.master.includes(serviceCallbackData)) {
            //             master.master.split('; ')[1].split(', ').forEach(service => {
            //                 if (service.includes(serviceCallbackData)) {
            //                     currentService = service;
            //                 }
            //             });
            //             mastersKeyboard.add({text: `${master.master.split('; ')[0] + `, ${currentService}`}`, callback_data: `master-${i + 1}`}).row();
            //         }
            //     });

            //     mastersKeyboard.add({text: '< Назад', callback_data: 'back-to-services'});

            //     return mastersKeyboard;
            // }).then(mastersKeyboard => {
            //     ctx.callbackQuery.message.editText('Выберите одного из наших мастеров', {
            //         reply_markup: mastersKeyboard
            //     })
            // });
        // });

        db.close((err) => {
            if (err) {
                console.error(err);
            } 
        });
    },
    requestContact(ctx) {
        ctx.reply('Отправьте номер телефона для связи с администратором.');
    },
    saveUserContact(ctx, db, sqlite3) {
        db = new sqlite3.Database('beauty_salon.db', (err) => {
            if (err) {
                console.error(err);
            }
        });

        if (ctx.msg.text.includes('+7') || ctx.msg.text.includes('8')) {
            db.run(`UPDATE orders SET phone="${ctx.msg.text}" WHERE userId="${ctx.msg.from.id}"`);

            ctx.reply('Телефон добавлен.')

            let checkOrderForReady = new Promise((resolve, reject) => {
                db.get(`SELECT * FROM orders WHERE userId="${ctx.msg.from.id}" `, [], (err, row) => {
                    if (row.service !== "empty" && row.master !== "empty" && row.phone !== "empty") {
                        resolve(row);
                    } else {
                        resolve(false);
                    }
                });
            });

            checkOrderForReady.then(userParametersForRequest => {
                if (userParametersForRequest) {
                    let name = ctx.msg.from.first_name;
                    let username;
                    if (ctx.msg.from.username) {
                        username = '@' + ctx.msg.from.username;
                    } else {
                        username = 'скрыт пользователем';
                    }
                    let requestText = `Заявка на услугу: ${userParametersForRequest.service},
Мастер: ${userParametersForRequest.master}.
                     
Информация о покупателе: 
Имя: ${name},
Телефон: ${userParametersForRequest.phone},
Юзернэйм телеграм: ${username}.`

                    ctx.api.sendMessage(process.env.MENEGER_ID, requestText);
                    ctx.reply('Заявка отправлена. Спасибо, что выбрали наш салон! С вами скоро свяжутся.')

                } else {
                    ctx.reply('Недостаточно данных для заявки на услугу. Повторите процесс записи заново.');
                }
            });
        }

        db.close((err) => {
            if (err) {
                console.error(err);
            } 
        });

    },
    sendMasterPortfolio(ctx, db, sqlite3) {
        let getMasterPortfolioLinks = new Promise((resolve, reject) => {
            db = new sqlite3.Database('beauty_salon.db', (err) => {
                if (err) {
                    console.error(err);
                }
            });

            db.get(`SELECT master FROM masters WHERE ID="${ctx.callbackQuery.data.slice(-1)}" `, [], (err, row) => {
                let photosArray = [];
                let linksArray = row?.master?.split('; ')[2].split(', ');
                linksArray.forEach(link => {
                    photosArray.push({
                        type: 'photo',
                        media: `${link}`
                    });
                });
                resolve(photosArray);
            });

            db.close((err) => {
                if (err) {
                    console.error(err);
                } 
            });
        });

        getMasterPortfolioLinks.then(photosArray => {
            if (photosArray.length < 2) {
                return ctx.replyWithPhoto(photosArray[0].media);
            } else {
                return ctx.replyWithMediaGroup(photosArray);
            }
        }).then(helper => {
            const backPhotoKeyboard = new InlineKeyboard()
                .text('< Назад', 'back-to-master-details');

            ctx.reply('Портфолио мастера', {
                reply_markup: backPhotoKeyboard
            });
        });
    },
    backToMasterDetailsKeyboard(ctx, db, sqlite3) {
        let getMasterFromOrders = new Promise((resolve, reject) => {
            db = new sqlite3.Database('beauty_salon.db', (err) => {
                if (err) {
                    console.error(err);
                }
            });

            db.get(`SELECT master FROM orders WHERE userId="${ctx.from.id}"`, [], (err, row) => {
                resolve(row.master);
            });

            db.close((err) => {
                if (err) {
                    console.error(err);
                } 
            });
        });

        getMasterFromOrders.then(masterName => {
            let getMasterFromMasters = new Promise((resolve, reject) => {
                db = new sqlite3.Database('beauty_salon.db', (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
    
                db.all(`SELECT master FROM masters `, [], (err, row) => {
                    row.forEach(masterObj => {
                        if (masterObj.master.includes(masterName)) {
                            resolve(masterObj.master.split('; ')[2].split(', ').length + 1);
                        }
                    });
                    
                });
    
                db.close((err) => {
                    if (err) {
                        console.error(err);
                    } 
                });
            });

            getMasterFromMasters.then(messagesCount => {
                let messageId = ctx.callbackQuery.message.message_id;

                for (let i = 0; i < messagesCount; i++) {
                    ctx.api.deleteMessage(ctx.msg.chat.id, messageId);
                    messageId -= 1;
                }
            });

        });
    },
    sendRulesForAddMaster(ctx) {
        ctx.reply(`Введите информацию о новом мастере, точно соблюдая шаблон. Соблюдайте регистр (строчные и прописные буквы), пробелы, запятые (знаки точка с запятой и обычная запятая имеют значение, ставьте их, как показано в шаблоне), тире (включая пробелы между ними), отступы после слов и символов.
        Шаблон: add_master Топ-мастер Иванов Иван; Стрижки - от 5000р, Укладки - 3000р, ...; https://первая_ссылка_на_фото_для_портфолио, https://вторая_ссылка_на_фото_для_портфолио, ..., https://последняя_ссылка_на_фото_для_портфолио
            
        Начинать нужно со слова add_master. Услуги и ссылки разделяются запятыми. Имя мастера отделяется от услуг и ссылок точкой с запятой, услуги от ссылок - тоже точкой с запятой. Не ставьте точку после последней ссылки. Все названия услуг мастера должны совпадать с названием добавленных услуг (включая регистр) и быть одинаковыми по написанию и регистру для всех мастеров, которые предоставляют такие услуги. Ссылок на фото для портфолио мастера может быть максимум 10. ВАЖНО: добавляя нового мастера, вы не добавляете новую услугу. Чтобы добавить новую услугу, воспользуйтесь командой \/add_service. По команде \/help вы получите список всех команд, доступных в боте.`);
    },
    addMaster(ctx, db, sqlite3) {
        db = new sqlite3.Database('beauty_salon.db', (err) => {
            if (err) {
                console.error(err);
            }
        });

        db.run(`INSERT INTO masters VALUES (NULL, "${ctx.msg.text.slice(11)}")`);

        db.close((err) => {
            if (err) {
                console.error(err);
            } 
        });

        ctx.reply('Мастер добавлен.');
    },
    sendRulesForAddService(ctx) {
        ctx.reply(`Введите название новой услуги, соблюдая шаблон. Название услуги должно точно совпадать с названием услуги в информации о мастре, включая регистр (строчные и заглавные буквы) и окончание. По команде \/help вы получите список всех команд, доступных в боте. Не ставьте точки, запятые и другие знаки препинания. За один раз вы можете добавить только одну услугу.
            
        Шаблон: add_service Стрижки`);
    },
    addService(ctx, db, sqlite3) {
        db = new sqlite3.Database('beauty_salon.db', (err) => {
            if (err) {
                console.error(err);
            }
        });

        db.run(`INSERT INTO services VALUES (NULL, "${ctx.msg.text.slice(12)}")`);

        db.close((err) => {
            if (err) {
                console.error(err);
            } 
        });

        ctx.reply('Услуга добавлена.');
    },
    sendRulesForDeleteMaster(ctx) {
        ctx.reply(`Чтобы удалить мастера, введите слово delete_master, затем имя мастера, как в шаблоне. Оно должно точно совпадать с именем мастера, которого вы хотите удалить, включая регистр. Приписки типа "Топ-мастер" можно не писать вместе с именем, но если напишите, то они также должны точно совпадать с теми, что есть у уже существующего мастера. 
            Шаблон: delete_master Иванов Иван`);
    },
    deleteMaster(ctx, db, sqlite3) {
        let masterName = ctx.msg.text.slice(14);
        let getMasterId = new Promise((resolve, reject) => {
            let masterId;

            db = new sqlite3.Database('beauty_salon.db', (err) => {
                if (err) {
                    console.error(err);
                }
            });
    
            db.all(`SELECT * FROM masters`, [], (err, row) => {
                row.forEach(masterObj => {
                    if (masterObj?.master?.includes(masterName)) {
                        masterId = masterObj?.ID;
                    }
                });
                resolve(masterId);
            });
    
            db.close((err) => {
                if (err) {
                    console.error(err);
                } 
            });
        });

        getMasterId.then(masterId => {
            if (masterId) {
                db = new sqlite3.Database('beauty_salon.db', (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
        
                db.run(`DELETE FROM masters WHERE ID=${masterId}`);
        
                db.close((err) => {
                    if (err) {
                        console.error(err);
                    } 
                });
    
                ctx.reply('Мастер удалён');
            } else {
                ctx.reply('Такого мастера нет.');
            }
        });
    },
    sendRulesForDeleteService(ctx) {
        ctx.reply(`Чтобы удалить услугу, введите слово delete_service, затем название услуги, как в шаблоне. Оно должно точно совпадать с названием услуги, которую вы хотите удалить, включая регистр. 
            Шаблон: delete_service Стрижки`);
    },
    deleteService(ctx, db, sqlite3) {
        let serviceName = ctx.msg.text.slice(15);

        let getServiceName = new Promise((resolve, reject) => {
            let serviceNameInPromise;

            db = new sqlite3.Database('beauty_salon.db', (err) => {
                if (err) {
                    console.error(err);
                }
            });
    
            db.all(`SELECT service FROM services`, [], (err, row) => {
                row.forEach(serviceObj => {
                    if (serviceObj?.service?.includes(serviceName)) {
                        serviceNameInPromise = serviceObj?.service;
                    }
                });
                resolve(serviceNameInPromise);
            });
    
            db.close((err) => {
                if (err) {
                    console.error(err);
                } 
            });
        });

        getServiceName.then(serviceName => {
            if (serviceName) {
                db = new sqlite3.Database('beauty_salon.db', (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
        
                db.run(`DELETE FROM services WHERE service="${serviceName}"`);
        
                db.close((err) => {
                    if (err) {
                        console.error(err);
                    } 
                });
        
                ctx.reply('Услуга удалена.');
            } else {
                ctx.reply('Такой услуги нет.');
            }
        });
    }
}