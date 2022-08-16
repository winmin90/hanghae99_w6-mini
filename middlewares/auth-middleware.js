const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = (req, res, next) => {
  // try {
    // Client 요청의 cookies 객체 중 토큰을 authorization으로 읽어들여서, 공백을 기준으로 두 조각으로 나눔
    const authorization = req.cookies.token;
    const [authType, authToken] = (authorization || "").split(" ");

    // 전달받은 인증값이 Bearer로 시작하지 않으면 인증 실패
    if (authType !== "Bearer") {
      res.status(401).send({
        errorMessage: "로그인 후 사용해주세요, Bearer가 아님",
      });
      return;
    }

    // 뒤쪽 'authToken'을 우리 secretKey를 가지고 인증해보고 에러 없으면, user 정보를 토근으로 다음 next으로 넘겨줌
    jwt.verify(
      authToken,
      "secret-key",

      async (error, decoded) => {
        // 인증 결과 에러가 나타나면 클라이언트와 서버에 모두 에러를 던지고 미들웨어 종료
        if (error) {
          res.status(401).send({
            errorMessage: "이용에 문제가 있습니다. 관리자에게 문의해주세요, 토큰 인증 실패",
          });
          console.error(error);
          return;
        }

        // 에러없이 잘 인증 된거면, 인증된 사용자이므로 decoding 된 decode 객체가 생김
        // 이 decoded 객체로 DB로부터 사용자 정보를 빼 와서 토큰을 res.locals(전역 객체) 위치에 반환
        let user = await User.findOne({ where: { userId: decoded.userId } });
        res.locals.user = user;
        next();
      }
    );

    // 에러 생기면 에러메세지
  // } catch (e) {
  //   res.status(401).send({
  //     errorMessage: "로그인 후 사용하세요",
  //   });
  //   return;
  // }
};
//   const { token } = req.cookies;
//   console.log(token);

//   if (!token) {
//     res.status(401).send({
//       errorMessage: "로그인 후 사용하세요.(1) 토큰 없음",
//     });
//     return;
//   }

//   try {
//     const { userId } = jwt.verify(token, "secret-key");

//     User.findByPk(userId).then((user) => {
//         console.log(user);
//       res.locals.user = user;
//       next();
//     });
//   } catch (error) {
//     res.status(401).send({
//       errorMessage: "로그인 후 사용하세요.(2) 토큰 검증 불가",
//     });
//     return;
//   }

