const { userMention } = require("discord.js");
const admin = require("firebase-admin");
const serviceAccount = require(process.env.DB_SERVICE_ACCOUNT);

module.exports = {
    initDatabase: function () {
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://koklesbot-default-rtdb.europe-west1.firebasedatabase.app",
        });

        return {
            app: app,
            db: admin.database(),

            setPrediction: async function (userId, matchId, team) {
                this.db.ref(`lolPredictionsMatch/${matchId}/user/${userId}`).set(team);
                this.db.ref(`lolPredictions/users/${userId}`).set(true);
            },

            getPredictionUsers: async function () {
                const db = this.db;
                const snapshot = await db.ref('lolPredictions/users').once('value');
                const coins = snapshot.val() ?? 0;
                return coins;
            },

            getUserFlagWins: async function (userId) {
                const db = this.db;
                const snapshot = await db.ref(`flagWins/${userId}`).once('value');
                const coins = snapshot.val() ?? 0;
                return coins;
            },

            awardUserFlagWin: async function (userId) {
                this.db.ref(`flagWins/${userId}`).set(admin.database.ServerValue.increment(1));
            },

            getTopUserFlagWins: async function (topN, alwaysIncludeUserId) {
                const names = [];
                const wins = [];
                await this.db.ref('flagWins').orderByValue().limitToLast(topN).once('value', snapshot => {
                    snapshot.forEach(data => {
                        names.push(userMention(data.key));
                        wins.push(data.val().toString());
                    });
                });

                if (!names.includes(userMention(alwaysIncludeUserId))) {
                    const alwaysIncludeUserWins = await this.getUserFlagWins(alwaysIncludeUserId);
                    names.unshift(userMention(alwaysIncludeUserId));
                    wins.unshift(alwaysIncludeUserWins.toString());
                }

                return [{ name: 'User', value: names.reverse().join('\n'), inline: true }, { name: 'Wins', value: wins.reverse().join('\n'), inline: true }];
            },

            getUserCoins: async function (userId) {
                const db = this.db;
                const snapshot = await db.ref(`users/${userId}/coins`).once('value');
                const coins = snapshot.val() ?? 0;
                return coins;
            },

            awardUserCoins: async function (userId, coins) {
                this.db.ref(`users/${userId}/coins`).set(admin.database.ServerValue.increment(coins));
            },

            userSoundsCache: new Map(),
            getUserSounds: async function (userId) {
                if (this.userSoundsCache.has(userId)) {
                    return this.userSoundsCache.get(userId);
                } else {
                    const db = this.db;
                    const userSoundsRef = db.ref(`users/${userId}/sounds`);

                    function constructArray(snapshotVal) {
                        const options = ['oof', 'sad', 'ty-kokot', 'error', 'trumpet'];
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
