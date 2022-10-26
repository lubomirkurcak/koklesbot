const { userMention } = require('discord.js');
const admin = require('firebase-admin');
const serviceAccount = require(process.env.DB_SERVICE_ACCOUNT);

module.exports = {
    initDatabase: function () {
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.DB_URL,
        });

        return {
            app: app,
            db: admin.database(),

            addFeedback: async function (userId, subject, message) {
                const data = { userId, subject, message, createdAt: Date.now() };
                const entryRef = await this.db.ref('feedback').push(data);
                return entryRef.key;
            },

            setUserSteamId: async function (guildId, userId, steamId) {
                this.db.ref(`guilds/${guildId}/steamIds/${userId}`).set(steamId);
            },
            getUserSteamIds: async function (guildId) {
                const snapshot = await this.db.ref(`guilds/${guildId}/steamIds`).once('value');
                return snapshot.val();
            },

            // @note: jobs
            setJobLastChange: async function (guildId, jobId, userId) {
                this.db.ref(`guilds/${guildId}/jobs/${jobId}/lastChange`).set({
                    by: userId,
                    at: (new Date()).getTime(),
                });
            },
            setJobSchedule: async function (guildId, jobId, schedule) {
                this.db.ref(`guilds/${guildId}/jobs/${jobId}/schedule`).set(schedule);
            },
            setJobData: async function (guildId, jobId, path, data) {
                this.db.ref(`guilds/${guildId}/jobs/${jobId}/data/${path}`).set(data);
            },
            setJobChannel: async function (guildId, jobId, channelId) {
                this.db.ref(`guilds/${guildId}/jobs/${jobId}/channelId`).set(channelId);
            },
            getJob: async function (guildId, jobId) {
                const snapshot = await this.db.ref(`guilds/${guildId}/jobs/${jobId}`).once('value');
                return snapshot.val();
            },

            // @note: disciplines
            // @todo: Caching?

            globalDisciplineRef: function (discipline, userId = null) {
                if (userId) {
                    return this.db.ref(`disciplines/${discipline}/users/${userId}`);
                }
                return this.db.ref(`disciplines/${discipline}/users`);
            },
            guildDisciplineRef: function (guildId, discipline, userId = null) {
                if (userId) {
                    return this.db.ref(`guilds/${guildId}/disciplines/${discipline}/users/${userId}`);
                }
                return this.db.ref(`guilds/${guildId}/disciplines/${discipline}/users`);
            },

            getDiscipline: async function (ref) {
                const snapshot = await ref.once('value');
                return snapshot.val() ?? 0;
            },
            incrementDiscipline: async function (ref, amount) {
                return await ref.set(admin.database.ServerValue.increment(amount));
            },
            // @note: make sure we're indexed in the database, otherwise this will be client side and slow (especially for global disciplines!)
            getTopDiscipline: async function (
                indexedRef, topN,
                alwaysIncludeUserId = null, alwaysIncludeRef = null,
                userFlavour = 'User', scoreFlavour = 'Score'
            ) {
                const names = [];
                const wins = [];
                await indexedRef.orderByValue().limitToLast(topN).once('value', snapshot => {
                    snapshot.forEach(data => {
                        names.push(userMention(data.key));
                        wins.push(data.val().toString());
                    });
                });

                if (alwaysIncludeUserId && !names.includes(userMention(alwaysIncludeUserId))) {
                    const alwaysIncludeUserWins = await this.getDiscipline(alwaysIncludeRef);
                    names.unshift(userMention(alwaysIncludeUserId));
                    wins.unshift(alwaysIncludeUserWins.toString());
                }

                return [{ name: userFlavour, value: names.reverse().join('\n'), inline: true }, { name: scoreFlavour, value: wins.reverse().join('\n'), inline: true }];
            },


            getGlobalDiscipline: async function (discipline, userId) {
                return await this.getDiscipline(this.globalDisciplineRef(discipline, userId));
            },
            getGuildDiscipline: async function (guildId, discipline, userId) {
                return await this.getDiscipline(this.guildDisciplineRef(guildId, discipline, userId));
            },

            awardGlobalDiscipline: async function (discipline, userId, amount) {
                return await this.incrementDiscipline(this.globalDisciplineRef(discipline, userId), amount);
            },
            awardGuildDiscipline: async function (guildId, discipline, userId, amount) {
                return await this.incrementDiscipline(this.guildDisciplineRef(guildId, discipline, userId), amount);
            },

            getTopGlobalDiscipline: async function (indexedDiscipline, topN, alwaysIncludeUserId = null, userFlavour = 'User', scoreFlavour = 'Score') {
                const alwaysIncludeRef = alwaysIncludeUserId ? this.globalDisciplineRef(indexedDiscipline, alwaysIncludeUserId) : null;
                return await this.getTopDiscipline(
                    this.globalDisciplineRef(indexedDiscipline), topN,
                    alwaysIncludeUserId, alwaysIncludeRef,
                    userFlavour, scoreFlavour
                );
            },
            getTopGuildDiscipline: async function (guildId, indexedDiscipline, topN, alwaysIncludeUserId = null, userFlavour = 'User', scoreFlavour = 'Score') {
                const alwaysIncludeRef = alwaysIncludeUserId ? this.guildDisciplineRef(guildId, indexedDiscipline, alwaysIncludeUserId) : null;
                return await this.getTopDiscipline(
                    this.guildDisciplineRef(guildId, indexedDiscipline), topN,
                    alwaysIncludeUserId, alwaysIncludeRef,
                    userFlavour, scoreFlavour
                );
            },

            getUserFlagWins: async function (userId) { return await this.getGlobalDiscipline('flagWins', userId); },
            awardUserFlagWin: async function (userId) { return await this.awardGlobalDiscipline('flagWins', userId, 1); },
            getTopUserFlagWins: async function (topN, alwaysIncludeUserId) { return await this.getTopGlobalDiscipline('flagWins', topN, alwaysIncludeUserId, 'Geographer', 'Wins'); },
            getUserCoins: async function (userId) { return await this.getGlobalDiscipline('coins', userId); },
            awardUserCoins: async function (userId, coins) { return await this.awardGlobalDiscipline('coins', userId, coins); },

            // @note: simple item
            // getSimpleGuildItem: async function (guildId, memberId, item) {
            // const snapshot = await this.db.ref(`guilds/${guildId}/members/${memberId}/simpleItems/${item}`).once('value');
            // return snapshot.val() ?? 0;
            // },

            // awardSimpleGuildItem: async function (guildId, memberId, item, amount) {
            // this.db.ref(`guilds/${guildId}/members/${memberId}/simpleItems/${item}`).set(admin.database.ServerValue.increment(amount));
            // },

            // @note: predictions
            setPrediction: async function (userId, matchId, team) {
                this.db.ref(`lolPredictionsMatch/${matchId}/user/${userId}`).set(team);
                this.db.ref(`lolPredictions/users/${userId}`).set(true);
            },

            getPredictionUsers: async function () {
                const snapshot = await this.db.ref('lolPredictions/users').once('value');
                return snapshot.val();
            },

            // @note: followers
            addFollower: async function (influencerId, userId) {
                this.db.ref(`users/${userId}/following/${influencerId}`).set(true);
                this.db.ref(`users/${influencerId}/followers/${userId}`).set(true);
            },

            getFollowerCount: async function (userId) {
                const snapshot = await this.db.ref(`users/${userId}/followers`).once('value');
                const value = snapshot.val();
                if (value) {
                    return Object.keys(value).length;
                }
                return 0;
            },


            // @note: items
            // getItemUser: async function (userId, collection, item) {
            //     const snapshot = await this.db.ref(`users/${userId}/${collection}/${item}`).once('value');
            //     return snapshot.val();
            // },

            // awardItemUser: async function (userId, collection, item, amount) {
            //     this.db.ref(`users/${userId}/${collection}/${item}`).set(admin.database.ServerValue.increment(amount));
            // },

            // getItemsUser: async function (userId, collection) {
            //     const userSoundsRef = db.ref(`users/${userId}/${collection}`);
            // },

            userSoundsCache: new Map(),
            getUserSounds: async function (userId) {
                if (this.userSoundsCache.has(userId)) {
                    return this.userSoundsCache.get(userId);
                } else {
                    const db = this.db;
                    const userSoundsRef = db.ref(`users/${userId}/sounds`);

                    function constructArray(snapshotVal) {
                        const options = ['oof', 'sad', 'ty-kokot', 'error'];
                        for (const key in snapshotVal) {
                            options.push(key);
                        }
                        return options;
                    }

                    userSoundsRef.on('value', snapshot => {
                        this.userSoundsCache.set(userId, constructArray(snapshot.val()));
                    });
                    await userSoundsRef.once('value', snapshot => {
                        this.userSoundsCache.set(userId, constructArray(snapshot.val()));
                    });

                    return this.userSoundsCache.get(userId);
                }
            },
        };
    },
};
