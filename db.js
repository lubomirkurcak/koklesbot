const { initializeApp } = require("firebase/app");
const { firebaseConfig } = require("./config");
const { getAuth, signInAnonymously } = require("firebase/auth");
const { getDatabase, ref, set, get, onValue, increment, update } = require("firebase/database");
module.exports = {
    initDatabase: function () {
        const app = initializeApp(firebaseConfig);
        // const auth = getAuth(app);
        // signInAnonymously(auth)
        //     .then(() => {
        //         console.log('Signed into db')
        //     })
        //     .catch((error) => {
        //         const errorCode = error.code;
        //         const errorMessage = error.message;
        //         console.log(`${errorCode}: ${errorMessage}`);
        //     });

        return {
            app: app,
            db: getDatabase(app),

            getUserFlagWins: async function (userId) {
                const db = this.db;
                const snapshot = await get(ref(db, `flagWins/${userId}`));
                const coins = snapshot.val() ?? 0;
                return coins;
            },

            awardUserFlagWin: async function (userId) {
                const db = this.db;
                const updates = {};
                updates[`flagWins/${userId}`] = increment(1);
                update(ref(db), updates);
            },

            getAllUserFlagWins: async function () {
                const db = this.db;
                const snapshot = await get(ref(db, 'flagWins'));
                const flagWins = snapshot.val();
                return flagWins;
            },

            getUserCoins: async function (userId) {
                const db = this.db;
                const snapshot = await get(ref(db, `users/${userId}/coins`));
                const coins = snapshot.val() ?? 0;
                return coins;
            },

            awardUserCoins: async function (userId, coins) {
                const db = this.db;
                const updates = {};
                updates[`users/${userId}/coins`] = increment(coins);
                update(ref(db), updates);
            },

            getUserSounds: async function (userId) {
                const options = [{ name: 'oof', value: 'oof' }];
                const db = this.db;
                const snapshot = await get(ref(db, `users/${userId}/sounds`));
                const sounds = snapshot.val();
                for (const key in sounds) {
                    options.push({ name: key, value: key });
                }
                return options;
            },

            userHasSound: async function (userId, sound) {
                const db = this.db;
                const snapshot = await get(ref(db, `users/${userId}/sounds/${sound}`));
                return snapshot.exists()
            },
        };
    },
};
