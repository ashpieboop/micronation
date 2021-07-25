import { BadRequestException } from "@nestjs/common";
import { UserController } from "../UserController";
import { UserService } from "../UserService";
import { EmailAlreadyTakenError } from "../errors/EmailAlreadyTakenError";
import { NicknameAlreadyTakenError } from "../errors/NicknameAlreadyTakenError";
import { EmailNotFoundError } from "../errors/EmailNotFoundError";
import { IncorrectPasswordError } from "../errors/IncorrectPasswordError";


describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeAll(async () => {
    userService = new UserService(null);
    userController = new UserController(userService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('register', () => {
    describe('success', () => {
      let registerSpy;
      let res;
      beforeAll(async () => {
        registerSpy = jest
          .spyOn(userService, 'register')
          .mockReturnValue({ fake: true } as any);
        res = await userController.register('user@example.com', 'password', 'password', 'jane');
      });
      it('calls register from service', () => {
        expect(registerSpy).toBeCalledTimes(1);
      });
      it('returns register return value', () => {
        expect(res).toStrictEqual({ success: true });
      });
    });
    describe('failure', () => {
      for (const error of [
        new EmailAlreadyTakenError(),
        new NicknameAlreadyTakenError(),
      ]) {
        describe(error.constructor.name, () => {
          let registerSpy;
          let res;
          beforeAll(async () => {
            registerSpy = jest
              .spyOn(userService, 'register')
              .mockImplementation(() => {
                throw error;
              });
            res = userController.register('user@example.com', 'password123', 'password123', 'jane');
          });
          it('calls register from service', () => {
            expect(registerSpy).toBeCalledTimes(1);
          });
          it('throws a BadRequestException when service throws a ' + error.constructor.name, async () => {
            await expect(res).rejects.toThrow(BadRequestException);
          });
        });
      }

      describe('bad field values', () => {
        function testBadValues(name: string, email: string, password: string, passwordConfirmation: string, nickname: string) {
          describe(name, () => {
            let registerSpy;
            let res;
            beforeAll(async () => {
              registerSpy = jest
                .spyOn(userService, 'register')
                .mockReturnValue({ fake: true } as any);
              res = userController.register(email, password, passwordConfirmation, nickname);
            });
            it('doesn\'t call register from service', () => {
              expect(registerSpy).not.toBeCalled();
            });
            it('throws a BadRequestException', async () => {
              await expect(res).rejects.toThrow(BadRequestException);
            });
          });
        }

        describe('email', () => {
          testBadValues('invalid email', 'not a valid email address', 'password123', 'password123', 'jane');
        });

        describe('password', () => {
          testBadValues('too short', 'user@example.com', 'abc12', 'abc12', 'jane');
          testBadValues('no number', 'user@example.com', 'password', 'password', 'jane');
          testBadValues('no letter', 'user@example.com', '1239009384657493', '1239009384657493', 'jane');
        });

        describe('passwordConfirmation', () => {
          testBadValues('incorrect', 'user@example.com', 'password123', 'password123 incorrect', 'jane');
        });

        describe('nickname', () => {
          testBadValues('too short', 'user@example.com', 'password123', 'password123', 'ab');
          testBadValues('has spaces', 'user@example.com', 'password123', 'password123', ' has spaces ');
          for (const invalidCharacter of ['!', '@', '+', '~', '$', '#', '%', '^', '&', '*']) {
            testBadValues(`invalid character ${invalidCharacter}`, 'user@example.com', 'password123', 'password123', `nick${invalidCharacter}name`);
          }
        });
      });
    });
  });

  describe('login', () => {
    describe('success', () => {
      let loginSpy;
      let res;
      beforeAll(async () => {
        loginSpy = jest
          .spyOn(userService, 'login')
          .mockReturnValue({ fake: true } as any);
        res = await userController.login('user@example.com', 'password123');
      });
      it('calls login from service', () => {
        expect(loginSpy).toBeCalledTimes(1);
      });
      it('returns login return value', () => {
        expect(res).toStrictEqual({ success: true });
      });
    });
    describe('failure', () => {
      for (const error of [
        new EmailNotFoundError(),
        new IncorrectPasswordError(),
      ]) {
        describe(error.constructor.name, () => {
          let loginSpy;
          let res;
          beforeAll(async () => {
            loginSpy = jest
              .spyOn(userService, 'login')
              .mockImplementation(() => {
                throw error;
              });
            res = userController.login('user@example.com', 'password123');
          });
          it('calls login from service', () => {
            expect(loginSpy).toBeCalledTimes(1);
          });
          it('throws a BadRequestException when service throws a ' + error.constructor.name, async () => {
            await expect(res).rejects.toThrow(BadRequestException);
          });
        });
      }

      describe('bad field values', () => {
        function testBadValues(name: string, email: string, password: string) {
          describe(name, () => {
            let loginSpy;
            let res;
            beforeAll(async () => {
              loginSpy = jest
                .spyOn(userService, 'login')
                .mockReturnValue({ fake: true } as any);
              res = userController.login(email, password);
            });
            it('doesn\'t call login from service', () => {
              expect(loginSpy).not.toBeCalled();
            });
            it('throws a BadRequestException', async () => {
              await expect(res).rejects.toThrow(BadRequestException);
            });
          });
        }

        describe('email', () => {
          testBadValues('invalid email', 'not a valid email address', 'password123');
        });

        describe('password', () => {
          testBadValues('too short', 'user@example.com', 'abc12');
          testBadValues('no number', 'user@example.com', 'password');
          testBadValues('no letter', 'user@example.com', '1239009384657493');
        });
      });
    });
  });

  describe('changePassword', () => {
    describe('success', () => {
      let changePasswordSpy;
      let res;
      beforeAll(async () => {
        changePasswordSpy = jest
          .spyOn(userService, 'changePassword')
          .mockReturnValue({ fake: true } as any);
        res = await userController.changePassword('oldpassword135', 'password123', 'password123');
      });
      it('calls changePassword from service', () => {
        expect(changePasswordSpy).toBeCalledTimes(1);
      });
      it('returns changePassword return value', () => {
        expect(res).toStrictEqual({ success: true });
      });
    });
    describe('failure', () => {
      describe('IncorrectPasswordError', () => {
        let changePasswordSpy;
        let res;
        beforeAll(async () => {
          changePasswordSpy = jest
            .spyOn(userService, 'changePassword')
            .mockImplementation(() => {
              throw new IncorrectPasswordError();
            });
          res = userController.changePassword('oldpassword135', 'password123', 'password123');
        });
        it('calls changePassword from service', () => {
          expect(changePasswordSpy).toBeCalledTimes(1);
        });
        it('throws a BadRequestException when service throws a IncorrectPasswordError', async () => {
          await expect(res).rejects.toThrow(BadRequestException);
        });
      });

      describe('bad field values', () => {
        function testBadValues(name: string, currentPassword: string, newPassword: string, newPasswordConfirmation: string) {
          describe(name, () => {
            let changePasswordSpy;
            let res;
            beforeAll(async () => {
              changePasswordSpy = jest
                .spyOn(userService, 'changePassword')
                .mockReturnValue({ fake: true } as any);
              res = userController.changePassword(currentPassword, newPassword, newPasswordConfirmation);
            });
            it('doesn\'t call register from service', () => {
              expect(changePasswordSpy).not.toBeCalled();
            });
            it('throws a BadRequestException', async () => {
              await expect(res).rejects.toThrow(BadRequestException);
            });
          });
        }

        describe('currentPassword', () => {
          testBadValues('too short', 'abc12', 'password123', 'password123');
          testBadValues('no number', 'password', 'password123', 'password123');
          testBadValues('no letter', '1239009384657493', 'password123', 'password123');
        });

        describe('newPassword', () => {
          testBadValues('too short', 'password123', 'abc12', 'abc12');
          testBadValues('no number', 'password123', 'password', 'password');
          testBadValues('no letter', 'password123', '1239009384657493', '1239009384657493');
        });

        describe('newPasswordConfirmation', () => {
          testBadValues('incorrect', 'password123', 'password123', 'password123 incorrect');
        });
      });
    });
  });

  describe('changeNickname', () => {
    describe('success', () => {
      let changeNicknameSpy;
      let res;
      beforeAll(async () => {
        changeNicknameSpy = jest
          .spyOn(userService, 'changeNickname')
          .mockReturnValue({ fake: true } as any);
        res = await userController.changeNickname('password123', 'jane2');
      });
      it('calls changeNickname from service', () => {
        expect(changeNicknameSpy).toBeCalledTimes(1);
      });
      it('returns changeNickname return value', () => {
        expect(res).toStrictEqual({ nickname: 'jane2' });
      });
    });
    describe('failure', () => {
      for (const error of [
        new IncorrectPasswordError(),
        new NicknameAlreadyTakenError(),
      ]) {
        describe(error.constructor.name, () => {
          let changeNicknameSpy;
          let res;
          beforeAll(async () => {
            changeNicknameSpy = jest
              .spyOn(userService, 'changeNickname')
              .mockImplementation(() => {
                throw error;
              });
            res = userController.changeNickname('password123', 'jane2');
          });
          it('calls changeNickname from service', () => {
            expect(changeNicknameSpy).toBeCalledTimes(1);
          });
          it('throws a BadRequestException when service throws a ' + error.constructor.name, async () => {
            await expect(res).rejects.toThrow(BadRequestException);
          });
        });
      }

      describe('bad field values', () => {
        function testBadValues(name: string, password: string, newNickname: string) {
          describe(name, () => {
            let changeNicknameSpy;
            let res;
            beforeAll(async () => {
              changeNicknameSpy = jest
                .spyOn(userService, 'changeNickname')
                .mockReturnValue({ fake: true } as any);
              res = userController.changeNickname(password, newNickname);
            });
            it('doesn\'t call changeNickname from service', () => {
              expect(changeNicknameSpy).not.toBeCalled();
            });
            it('throws a BadRequestException', async () => {
              await expect(res).rejects.toThrow(BadRequestException);
            });
          });
        }

        describe('password', () => {
          testBadValues('too short', 'abc12', 'nickname');
          testBadValues('no number', 'password', 'nickname');
          testBadValues('no letter', '1239009384657493', 'nickname');
        });

        describe('newNickname', () => {
          testBadValues('too short', 'password123', 'ab');
          testBadValues('has spaces', 'password123', ' has spaces ');
          for (const invalidCharacter of ['!', '@', '+', '~', '$', '#', '%', '^', '&', '*']) {
            testBadValues(`invalid character ${invalidCharacter}`, 'password123', `nick${invalidCharacter}name`);
          }
        });
      });
    });
  });
});
