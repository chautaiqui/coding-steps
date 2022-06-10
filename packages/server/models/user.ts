import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const Schema = mongoose.Schema;

const Session = new Schema({
    refreshToken: {
        type: String,
        default: "",
    },
});

const UserSchema = new Schema({
    firstName: {
        type: String,
        default: "",
    },
    lastName: {
        type: String,
        default: "",
    },
    authStrategy: {
        type: String,
        default: "local",
    },
    points: {
        type: Number,
        default: 50,
    },
    refreshToken: {
        type: [Session],
    },
});

UserSchema.set("toJSON", {
    transform: (doc, ret, options) => {
        // Remove refreshToken from the response
        delete ret.refreshToken;

        return ret;
    },
});

UserSchema.plugin(passportLocalMongoose);

export const User = mongoose.model("User", UserSchema);
