"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSquard = exports.rejectUser = exports.approveUser = exports.deleteSingleSquard = exports.getAllSquards = exports.deleteSingleOrganizer = exports.deleteSingleUser = exports.getAllOrganizers = exports.getAllUsers = exports.getUserNameAndLocation = exports.getUserProfile = exports.verifyUserIdentity = exports.validateSession = exports.organizerSignup = exports.signup = exports.adminLogin = exports.login = void 0;
const authClass_1 = require("./authClass");
const apiResponseMiddleware_1 = require("../../Middleware/apiResponseMiddleware");
const validators_1 = require("../../Utililes/validators");
const passwordEncryption_1 = require("../../Utililes/passwordEncryption");
const Storage_1 = require("../../Services/Storage");
const jwt_1 = require("../../Utililes/jwt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authInstance = new authClass_1.AuthClass();
const isValidData = (data, fields) => {
    return fields.every((field) => typeof data[field] === "string" && data[field].trim() !== "");
};
//LOGIN ENDPOINT--> http://localhost:3000/auth/login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        if (!isValidData(userData, ["email", "password"])) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "All fields are required", null, 401);
        }
        if (!validators_1.Validators.isValidEmail(userData.email)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Enter valid email", null, 401);
        }
        const isUserExists = yield authInstance.userLogin(userData);
        if (isUserExists.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        if (isUserExists.data.length <= 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "No user found with provided credentials", null, 401);
        }
        const isPasswordCorrect = yield passwordEncryption_1.PasswordEncryption.comparePassword(userData.password, isUserExists.data[0].password);
        if (!isPasswordCorrect) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Password does not match with your credentials", null, 401);
        }
        const token = yield jwt_1.Jwt.generateToken({
            id: isUserExists.data[0]._id,
            role: isUserExists.data[0].role,
        });
        if (token.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        const accessToken = {
            accessToken: token.data
        };
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, accessToken, "Login Successful", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.login = login;
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        if (!isValidData(userData, ["email", "password"])) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "All fields are required", null, 401);
        }
        if (!validators_1.Validators.isValidEmail(userData.email)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Enter valid email", null, 401);
        }
        const isUserExists = yield authInstance.adminLogin(userData);
        if (isUserExists.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        if (isUserExists.data.length <= 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "No user found with provided credentials", null, 401);
        }
        const isPasswordCorrect = yield passwordEncryption_1.PasswordEncryption.comparePassword(userData.password, isUserExists.data[0].password);
        if (!isPasswordCorrect) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Password does not match with your credentials", null, 401);
        }
        const token = yield jwt_1.Jwt.generateToken({
            id: isUserExists.data[0]._id,
            role: isUserExists.data[0].role,
        });
        if (token.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        const accessToken = {
            accessToken: token.data
        };
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, accessToken, "Login Successful", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.adminLogin = adminLogin;
//SIGNUP ENDPOINT--> http://localhost:3000/auth/signup
//               --> http://localhost:3000/auth/organizer/signup
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        let userData;
        if (req.body.data) {
            userData = JSON.parse(req.body.data);
        }
        else {
            userData = req.body;
        }
        //rollback implement
        //latitude and longitude range should check==>pending
        //college code range check and duplicate check
        console.log("userData:");
        Object.entries(userData).forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
        });
        if (!userData.role) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "user role is required", null, 401);
        }
        const requiredFields = userData.role !== "organizer"
            ? ["name", "email", "ccode", "mobile", "role", "password", "location"]
            : [
                "name",
                "email",
                "ccode",
                "mobile",
                "role",
                "password",
                "location",
                "longitude",
                "latitude",
                "collegeName",
                "collegeCode",
            ];
        if (userData.role === "organizer" && !req.files) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "all image files required ", null, 401);
        }
        if (!isValidData(userData, requiredFields)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "All fields are requireds", null, 401);
        }
        if (!validators_1.Validators.isValidEmail(userData.email)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Enter valid email", null, 401);
        }
        if (!validators_1.Validators.isValidMobile(userData.mobile)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Enter valid mobile", null, 401);
        }
        if (!validators_1.Validators.isValidPassword(userData.password)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Password must be includes (uppercase, symbols, and numbers)", null, 401);
        }
        const isUserExists = yield authInstance.isUserExistsOnMobileOrEmail(userData.email, userData.mobile);
        if (!isUserExists.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        console.log((_a = isUserExists.data) === null || _a === void 0 ? void 0 : _a.length);
        if (((_b = isUserExists.data) === null || _b === void 0 ? void 0 : _b.length) > 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Email or Mobile already in use", null, 401);
        }
        const hashedPassword = yield passwordEncryption_1.PasswordEncryption.hashPassword(userData.password);
        userData.password = hashedPassword;
        let responseData;
        if (userData.role === "organizer") {
            const isOrganiztionCodeExists = yield authInstance.isOrganizationCodeExists(userData.collegeCode);
            if (!isOrganiztionCodeExists.status) {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
            }
            console.log(isOrganiztionCodeExists.data.length);
            if (isOrganiztionCodeExists.data.length > 0) {
                return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Organization code already in use", null, 401);
            }
            const imageList = {
                proof: [],
                noc: null,
            };
            if (Array.isArray(req.files)) {
                req.files.forEach((file) => {
                    if (file.fieldname === "noc") {
                        imageList.noc = file;
                    }
                    else if (file.fieldname === "proof") {
                        imageList.proof.push(file);
                    }
                });
            }
            else {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Image files not found", 400);
            }
            if (imageList.noc == null || imageList.proof.length <= 0) {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "noc or proof missing", 400);
            }
            const nocPdfUploadedResponse = yield Storage_1.FirebaseStorage.uploadSingleImage(`DOCUMENTS/NOC`, imageList.noc);
            if (nocPdfUploadedResponse.status === false) {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, (_c = nocPdfUploadedResponse.message) !== null && _c !== void 0 ? _c : "failed to upload NOC . try again!", 500);
            }
            const proofImgUploadedResponse = yield Storage_1.FirebaseStorage.uploadCoverImages(`USERS/PROOF`, imageList.proof);
            if (proofImgUploadedResponse.status === false) {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "failed to upload proof images. try again later", 500);
            }
            console.log(nocPdfUploadedResponse);
            userData.proof = JSON.stringify(proofImgUploadedResponse.urls);
            userData.collegeNoc = nocPdfUploadedResponse.url;
            console.log(userData);
            responseData = yield authInstance.organizerSignup(userData);
            if (!responseData.status) {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
            }
        }
        else {
            responseData = yield authInstance.userSignup(userData);
            if (responseData.status === false) {
                return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
            }
        }
        console.log(responseData);
        console.log(responseData.data);
        console.log("NEW DATA:" +
            responseData.data[0] +
            userData.role);
        const token = yield jwt_1.Jwt.generateToken({
            id: responseData.data[0],
            role: userData.role,
        });
        if (token.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        const accessToken = {
            accessToken: token.data
        };
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, accessToken, "Signup Successful", 200);
    }
    catch (error) {
        console.log(error);
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.signup = signup;
const organizerSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    try {
        const userData = req.body.data ? JSON.parse(req.body.data) : req.body;
        const requiredFields = [
            "name", "email", "ccode", "mobile", "role", "password",
            "location", "longitude", "latitude", "collegeName", "collegeCode"
        ];
        if (!req.files || !req.files.length) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "All image files required", null, 400);
        }
        if (!isValidData(userData, requiredFields)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "All fields are required", null, 400);
        }
        if (!validators_1.Validators.isValidEmail(userData.email)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Enter valid email", null, 400);
        }
        if (!validators_1.Validators.isValidMobile(userData.mobile)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Enter valid mobile", null, 400);
        }
        if (!validators_1.Validators.isValidPassword(userData.password)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Password must include uppercase, symbol, and number", null, 400);
        }
        const isUserExists = yield authInstance.isUserExistsOnMobileOrEmail(userData.email, userData.mobile);
        if (!isUserExists.status || ((_d = isUserExists.data) === null || _d === void 0 ? void 0 : _d.length) > 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Email or Mobile already in use", null, 409);
        }
        const isOrgCodeExists = yield authInstance.isOrganizationCodeExists(userData.collegeCode);
        if (!isOrgCodeExists.status || ((_e = isOrgCodeExists.data) === null || _e === void 0 ? void 0 : _e.length) > 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Organization code already in use", null, 409);
        }
        const files = req.files;
        const imageList = { proof: [], noc: null };
        for (const file of files) {
            if (file.fieldname === "noc")
                imageList.noc = file;
            else if (file.fieldname === "proof")
                imageList.proof.push(file);
        }
        if (!imageList.noc || imageList.proof.length === 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "noc or proof missing", 400);
        }
        const nocResponse = yield Storage_1.FirebaseStorage.uploadSingleImage("DOCUMENTS/NOC", imageList.noc);
        if (!nocResponse.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, nocResponse.message || "Failed to upload NOC", 500);
        }
        const proofResponse = yield Storage_1.FirebaseStorage.uploadCoverImages("USERS/PROOF", imageList.proof);
        if (!proofResponse.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Failed to upload proof images", 500);
        }
        userData.password = yield passwordEncryption_1.PasswordEncryption.hashPassword(userData.password);
        userData.proof = JSON.stringify(proofResponse.urls);
        userData.collegeNoc = nocResponse.url;
        const responseData = yield authInstance.organizerSignup(userData);
        if (!responseData.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        const token = yield jwt_1.Jwt.generateToken({ id: responseData.data[0], role: userData.role });
        if (!token.status) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, { accessToken: token.data }, "Signup Successful", 200);
    }
    catch (error) {
        console.error(error);
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 500);
    }
});
exports.organizerSignup = organizerSignup;
const validateSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ success: false, message: "Unauthorized: No token provided" });
        }
        const token = authHeader.split(" ")[1];
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY || "12345qwer");
        return res.status(200).send({
            success: true,
            data: token,
            message: "Valid session"
        });
    }
    catch (err) {
        return res.status(401).send({ success: false, message: "Invalid or expired token" });
    }
});
exports.validateSession = validateSession;
//VERIFY-USER-IDENTITY ENDPOINT--> http://localhost:3000/
const verifyUserIdentity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    try {
        const userData = JSON.parse(req.body.data);
        const user = req.user;
        if (!user) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Something went wrong", 500);
        }
        const requiredFields = [
            "name",
            "email",
            "ccode",
            "mobile",
            "role",
            "location",
        ];
        if (!isValidData(userData, requiredFields)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "All fields are required", null, 401);
        }
        if (!validators_1.Validators.isValidEmail(userData.email)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Enter valid email", 401);
        }
        if (!validators_1.Validators.isValidMobile(userData.mobile)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Enter valid mobile", 401);
        }
        const isUserVerified = yield authInstance.isVerifiedUser(user.id);
        if (isUserVerified.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        if (isUserVerified.data[0].status === "pending") {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "User is verified request is pending..", 401);
        }
        if (isUserVerified.data[0].status === "active") {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "User is already verified user", 401);
        }
        console.log(user.id);
        const isEmailMobileExists = yield authInstance.isUserExistsOnMobileOrEmailWithoutSpecificId(user.id, userData.email, userData.mobile);
        console.log(isEmailMobileExists.data);
        if (isEmailMobileExists.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        if (isEmailMobileExists.data.length > 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Email or Mobile already in use", 401);
        }
        ////////////////////////////////////////////////////////////////////////
        const imageList = {
            proof: [],
            profile: null,
        };
        if (Array.isArray(req.files)) {
            req.files.forEach((file) => {
                if (file.fieldname === "noc") {
                    imageList.noc = file;
                }
                else if (file.fieldname === "proof") {
                    imageList.proof.push(file);
                }
            });
        }
        else {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Image files not found", 400);
        }
        // if (imageList.noc == null || imageList.proof.length <= 0) {
        //   return ApiResponseHandler.error(res, "noc or proof missing", 400);
        // }
        // const nocPdfUploadedResponse: FileStorageResponse =
        //   await FirebaseStorage.uploadSingleImage(`DOCUMENTS/NOC`, imageList.noc);
        // if (nocPdfUploadedResponse.status === false) {
        //   return ApiResponseHandler.error(
        //     res,
        //     nocPdfUploadedResponse.message ?? "failed to upload NOC . try again!",
        //     500
        //   );
        // }
        // const proofImgUploadedResponse: FileStorageResponse =
        //   await FirebaseStorage.uploadCoverImages(`USERS/PROOF`, imageList.proof);
        // if (proofImgUploadedResponse.status === false) {
        //   return ApiResponseHandler.error(
        //     res,
        //     "failed to upload proof images. try again later",
        //     500
        //   );
        // }
        // console.log(nocPdfUploadedResponse);
        // userData.proof = JSON.stringify(proofImgUploadedResponse.urls);
        // userData.collegeNoc = nocPdfUploadedResponse.url;
        // console.log(userData);
        ///////////////////////////////////////////////////////////////////////
        if (Array.isArray(req.files)) {
            req.files.forEach((file) => {
                if (file.fieldname === "proof") {
                    imageList.proof.push(file);
                }
                else if (file.fieldname === "profile") {
                    imageList.profile = file;
                }
            });
        }
        else {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Image files not found", 400);
        }
        if (imageList.proof.length <= 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, " proof missing", 400);
        }
        if (imageList.profile == null || imageList.proof.length <= 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "noc or proof missing", 400);
        }
        const profileUploadedResponse = yield Storage_1.FirebaseStorage.uploadSingleImage(`USERS/PROFILE`, imageList.profile);
        if (profileUploadedResponse.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, (_f = profileUploadedResponse.message) !== null && _f !== void 0 ? _f : "failed to upload Profile . try again!", 500);
        }
        const proofImgUploadedResponse = yield Storage_1.FirebaseStorage.uploadCoverImages(`USERS/PROOF`, imageList.proof);
        if (proofImgUploadedResponse.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "failed to upload proof images. try again later", 500);
        }
        userData.proof = JSON.stringify(proofImgUploadedResponse.urls);
        userData.profile = profileUploadedResponse.url;
        const responseData = yield authInstance.updateUserIdentity(user.id, userData);
        if (responseData.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, null, "User verified request success..", 200);
    }
    catch (error) {
        console.log(error);
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.verifyUserIdentity = verifyUserIdentity;
//------------------------
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!(user === null || user === void 0 ? void 0 : user.id)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "User id missing", 400);
        }
        if (!(user === null || user === void 0 ? void 0 : user.role)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "User role missing", 400);
        }
        //PENDING --> Combine two tables
        const userData = yield authInstance.getUserProfile(user.role, user.id);
        console.log(userData);
        if (userData.data.length <= 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "userData not found", 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, userData.data, "User", 200);
    }
    catch (error) {
        console.log(error);
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.getUserProfile = getUserProfile;
const getUserNameAndLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!(user === null || user === void 0 ? void 0 : user.id)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "User id missing", 400);
        }
        if (!(user === null || user === void 0 ? void 0 : user.role)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "User role missing", 400);
        }
        //PENDING --> Combine two tables
        const userData = yield authInstance.getUserNameAndLocation(user.role, user.id);
        console.log(userData);
        if (userData.data.length <= 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "userData not found", 404);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, userData.data, "User", 200);
    }
    catch (error) {
        console.log(error);
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.getUserNameAndLocation = getUserNameAndLocation;
// //CHANGE-PASSWORD ENDPOINT--> http://localhost:3000/
// export const changePassword = async (req: Request, res: Response) => {
//   try {
//     const userData = req.body;
//     const user = req.user;
//     if (!user) {
//       return ApiResponseHandler.warning(res, "Something went wrong", 500);
//     }
//     const requiredFields = [
//       "currrentPassword",
//       "newPassword",
//       "confirmPassword",
//     ];
//     if (!isValidData(userData, requiredFields)) {
//       return ApiResponseHandler.warning(res, "All fields are required", 401);
//     }
//     if (userData.newPassword !== userData.confirmPassword) {
//       return ApiResponseHandler.warning(
//         res,
//         "New password and confirm password does not match",
//         400
//       );
//     }
//     const isUserExistsOnIdAndRole = await authInstance.isUserExistsOnIdAndRole(
//       user!.id,
//       user!.role
//     );
//     if (isUserExistsOnIdAndRole.status === false) {
//       return ApiResponseHandler.error(
//         res,
//         "Something went wrong. Try again!",
//         500
//       );
//     }
//     if (isUserExistsOnIdAndRole.data.length > 0) {
//       return ApiResponseHandler.warning(res, "user not found", 404);
//     }
//     const isPasswordCorrect = await PasswordEncryption.comparePassword(
//       userData.currentPassword,
//       isUserExistsOnIdAndRole.data[0].password
//     );
//     if (!isPasswordCorrect) {
//       return ApiResponseHandler.warning(res, "current password wrong", 401);
//     }
//     const hashedPassword = await PasswordEncryption.hashPassword(
//       userData.newPassword
//     );
//     const results = await db("users").where({ _id: user!.id }).update({
//       password: hashedPassword,
//     });
//     return ApiResponseHandler.success(res, null, "User password changed", 200);
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
// };
// //UPDATE-PROFILE-PHOTO ENDPOINT--> http://localhost:3000/
// export const updateProfilePhoto = async (req: Request, res: Response) => {
//   try {
//     const userData = req.body;
//     const user = req.user;
//     // PENDING WORK --> upload user profile and delete old profile in firebase
//     if (!user) {
//       return ApiResponseHandler.warning(res, "Something went wrong", 500);
//     }
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
// };
// //UPDATE-USER-DETAILS ENDPOINT--> http://localhost:3000/
// export const updateUserDetails = async (req: Request, res: Response) => {
//   try {
//     // PENDING WORK
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
// };
// //ADMIN-->GET-ALL-USER--> http://localhost:3000/
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield authInstance.getAllUsers("user");
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, users.data, "Users", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.getAllUsers = getAllUsers;
//ADMIN-->GET-ALL-ORGANIZERS--> http://localhost:3000/
const getAllOrganizers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const organizers = yield authInstance.getAllUsers("organizer");
        //PENDING --> Combine two tables
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, organizers.data, "Organizers", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.getAllOrganizers = getAllOrganizers;
// //ADMIN-->GET-SINGLE-USER--> http://localhost:3000/
// export const getSingleUser = async (req: Request, res: Response) => {
//   try {
//     const id = req.body.id;
//     if (!id) {
//       return ApiResponseHandler.warning(res, "User id missing", 400);
//     }
//     const users = await authInstance.getSingleUser("user", id);
//     if (users.data.length > 0) {
//       return ApiResponseHandler.warning(res, "user not found", 404);
//     }
//     return ApiResponseHandler.success(res, users.data, "User", 200);
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
// };
//ADMIN-->DELETE-USER--> http://localhost:3000/
const deleteSingleUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // PENDING WORK --> delete user profile in firebase
        const id = req.body.id;
        if (!id) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "User id missing", 400);
        }
        const deleteUser = yield authInstance.deleteUser("user", id);
        if (deleteUser.data > 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.success(res, null, "User deleted", 200);
        }
        else {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "user not found", 404);
        }
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.deleteSingleUser = deleteSingleUser;
//ADMIN-->GET-SINGLE-ORGANIZERS--> http://localhost:3000/
// export const getSingleOrganizer = async (req: Request, res: Response) => {
//   try {
//     const id = req.body.id;
//     if (!id) {
//       return ApiResponseHandler.warning(res, "User id missing", 400);
//     }
//     //PENDING --> Combine two tables
//     const organizer = await authInstance.getSingleUser("organizer", id);
//     if (organizer.data.length > 0) {
//       return ApiResponseHandler.warning(res, "organizer not found", 404);
//     }
//     return ApiResponseHandler.success(res, organizer.data, "User", 200);
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
// };
//ADMIN-->DELETE-SINGLE-ORGANIZERS--> http://localhost:3000/
const deleteSingleOrganizer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // PENDING WORK --> delete organizer profile in firebase
        const id = req.body.id;
        if (!id) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "User id missing", 400);
        }
        //PENDING --> Combine two tables
        const Organiser = yield authInstance.deleteUser("organizer", id);
        if (Organiser.data > 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.success(res, null, "Orgnaizer deleted", 200);
        }
        else {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Orgnaizer not found", 404);
        }
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.deleteSingleOrganizer = deleteSingleOrganizer;
//ADMIN-->GET-ALL-SQUARDS--> http://localhost:3000/
const getAllSquards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const squards = yield authInstance.getAllUsers("squard");
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, squards.data, "Squards", 200);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.getAllSquards = getAllSquards;
//ADMIN-->GET-SINGLE-SQUARDS--> http://localhost:3000/
// export const getSingleSquards = async (req: Request, res: Response) => {
//   try {
//     const id = req.body.id;
//     if (!id) {
//       return ApiResponseHandler.warning(res, "Squard id missing", 400);
//     }
//     const squard = await authInstance.getSingleUser("squard", id);
//     if (squard.data.length > 0) {
//       return ApiResponseHandler.warning(res, "squard not found", 404);
//     }
//     return ApiResponseHandler.success(res, squard.data, "User", 200);
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
// };
//ADMIN-->DELETE-SINGLE-SQUARDS--> http://localhost:3000/
const deleteSingleSquard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // PENDING WORK --> delete user profile in firebase
        const id = req.body.id;
        if (!id) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Squard id missing", 400);
        }
        const squard = yield authInstance.deleteUser("squard", id);
        if (squard.data > 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.success(res, null, "Squard deleted", 200);
        }
        else {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Squard not found", 404);
        }
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.deleteSingleSquard = deleteSingleSquard;
//ADMIN-->APPROVE-ORGANIZER--> http://localhost:3000/
//ADMIN-->APPROVE-USER--> http://localhost:3000/
const approveUser = (req, res) => {
    try {
        const approvedBy = req.user.id;
        if (!approvedBy) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Approver id missing", 400);
        }
        const userId = req.body.id;
        if (!userId) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "User id missing", 400);
        }
        const user = authInstance.updateUserStatus("approve", userId, approvedBy);
        if (user > 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.success(res, null, "User approved", 200);
        }
        else {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "User not found", 404);
        }
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
};
exports.approveUser = approveUser;
//ADMIN-->REJECT-ORGANIZER--> http://localhost:3000/
//ADMIN-->REJECT-USER--> http://localhost:3000/
const rejectUser = (req, res) => {
    try {
        const approvedBy = req.user.id;
        if (!approvedBy) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Approver id missing", 400);
        }
        const userId = req.body.id;
        const denialReason = req.body.denialReason;
        if (!userId) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "User id missing", 400);
        }
        const user = authInstance.updateUserStatus("reject", userId, approvedBy, denialReason);
        if (user > 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.success(res, null, "User rejected", 200);
        }
        else {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "User not found", 404);
        }
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
};
exports.rejectUser = rejectUser;
//ADMIN-->ADD-INTERNAL-TEAM--> http://localhost:3000/
const createSquard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //PENDING-->  upload profile pic in firestore
        const approvedBy = req.user.id;
        if (!approvedBy) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Approver id missing", 400);
        }
        const squardData = req.body;
        const requiredFields = [
            "name",
            "email",
            "password",
            "c_code",
            "mobile",
            "profile",
            "role",
            "location",
            "status",
        ];
        if (!isValidData(squardData, requiredFields)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "All fields are required", 401);
        }
        if (!validators_1.Validators.isValidEmail(squardData.email)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Enter valid email", 401);
        }
        if (!validators_1.Validators.isValidMobile(squardData.mobile)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Enter valid mobile", 401);
        }
        if (!validators_1.Validators.isValidPassword(squardData.password)) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*())", 401);
        }
        const isSquardExists = yield authInstance.isUserExistsOnMobileOrEmail(squardData.email, squardData.mobile);
        if (isSquardExists.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        if (isSquardExists.data.length > 0) {
            return apiResponseMiddleware_1.ApiResponseHandler.warning(res, "Email or Mobile already in use", 401);
        }
        const hashedPassword = yield passwordEncryption_1.PasswordEncryption.hashPassword(squardData.password);
        squardData.password = hashedPassword;
        const squard = yield authInstance.createSquard(squardData);
        if (squard.status === false) {
            return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Something went wrong. Try again!", 500);
        }
        return apiResponseMiddleware_1.ApiResponseHandler.success(res, null, "Squard created", 201);
    }
    catch (error) {
        return apiResponseMiddleware_1.ApiResponseHandler.error(res, "Internal server error", 501);
    }
});
exports.createSquard = createSquard;
//ADMIN-->UPDATE-INTERNAL-TEAM--> http://localhost:3000/
// export const updateSquard = async (req: Request, res: Response) => {
//   try {
//     //PENDING-->  upload profile pic in firestore
//     const approvedBy = req.user!.id;
//     if (!approvedBy) {
//       return ApiResponseHandler.warning(res, "Approver id missing", 400);
//     }
//     const squardData = req.body;
//     const requiredFields = [
//       "name",
//       "email",
//       "password",
//       "c_code",
//       "mobile",
//       "role",
//       "location",
//       "status",
//     ];
//     if (!isValidData(squardData, requiredFields)) {
//       return ApiResponseHandler.warning(res, "All fields are required", 401);
//     }
//     if (!Validators.isValidEmail(squardData.email)) {
//       return ApiResponseHandler.warning(res, "Enter valid email", 401);
//     }
//     if (!Validators.isValidMobile(squardData.mobile)) {
//       return ApiResponseHandler.warning(res, "Enter valid mobile", 401);
//     }
//     if (!Validators.isValidPassword(squardData.password)) {
//       return ApiResponseHandler.warning(
//         res,
//         "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*())",
//         401
//       );
//     }
//     const isSquardExists: any =
//       await authInstance.isUserExistsOnMobileOrEmailWithoutSpecificId(
//         squardData.userId,
//         squardData.email,
//         squardData.mobile
//       );
//     if (isSquardExists.status === false) {
//       return ApiResponseHandler.error(
//         res,
//         "Something went wrong. Try again!",
//         500
//       );
//     }
//     if (isSquardExists.data.length > 0) {
//       return ApiResponseHandler.warning(
//         res,
//         "Email or Mobile already in use",
//         401
//       );
//     }
//     const hashedPassword = await PasswordEncryption.hashPassword(
//       squardData.password
//     );
//     squardData.password = hashedPassword;
//     const squard: any = await authInstance.updateSquard(squardData);
//     if (squard.status === false) {
//       return ApiResponseHandler.error(
//         res,
//         "Something went wrong. Try again!",
//         500
//       );
//     }
//     if (squard > 0) {
//       return ApiResponseHandler.success(res, null, "Squard created", 201);
//     } else {
//       return ApiResponseHandler.warning(res, "Squard not found", 404);
//     }
//   } catch (error) {
//     return ApiResponseHandler.error(res, "Internal server error", 501);
//   }
