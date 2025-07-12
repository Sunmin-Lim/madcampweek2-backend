const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../../../models/User');
const jwt = require('jsonwebtoken');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_secret_key';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// passport.use(new GitHubStrategy(
//   {
//     clientID: GITHUB_CLIENT_ID,
//     clientSecret: GITHUB_CLIENT_SECRET,
//     callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       console.log('✅ GitHub 프로필:', profile);

//       // Email 처리
//       const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;

//       // 사용자 조회 또는 생성
//       let user = await User.findOne({ email });
//       if (!user) {
//         user = new User({
//           email,
//           username: profile.username,
//           githubId: profile.id,
//           clonedRepos: [],
//         });
//         await user.save();
//         console.log('✅ 새 사용자 생성:', user);
//       } else {
//         console.log('✅ 기존 사용자 로그인:', user);
//       }

//       done(null, user);
//     } catch (error) {
//       console.error('❌ GitHub OAuth 처리 오류:', error);
//       done(error, null);
//     }
//   }
// ));


passport.use(new GitHubStrategy(
  {
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('✅ GitHub 프로필:', profile);

      // Check if a user already exists by GitHub ID
      let user = await User.findOne({ githubId: profile.id });
      if (!user) {
        // If no user exists, check by email (in case the user registered before with email/password)
        user = await User.findOne({ email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com` });
      }

      // If user does not exist, we create a new account
      if (!user) {
        user = new User({
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`,
          username: profile.username,
          githubId: profile.id,
          clonedRepos: [],
        });
        await user.save();
        console.log('✅ 새 사용자 생성:', user);
      } else {
        console.log('✅ 기존 사용자 로그인:', user);
      }

      done(null, user);
    } catch (error) {
      console.error('❌ GitHub OAuth 처리 오류:', error);
      done(error, null);
    }
  }
));