import mongoose from 'mongoose'

const reviewSchema = mongoose.Schema({
    firstname: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
},
    {
        timestamps: true
    }
)

reviewSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

reviewSchema.set('toJSON', {
    virtuals: true,
});

const Review = mongoose.model('Review', reviewSchema)

export default Review