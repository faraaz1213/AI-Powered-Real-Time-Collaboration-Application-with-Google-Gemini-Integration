import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
}, { timestamps: true });

userSchema.statics.hashPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

userSchema.methods.isValidPassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = function() {
    return jwt.sign({ email: this.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// 🔹 Fix here: model name lowercase 'user'
const User = mongoose.model('user', userSchema);

export default User;
