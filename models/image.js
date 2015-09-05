var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var Schema = mongoose.Schema;
var imageSchema = new Schema({
    title: String,
    name: String,
    source: String,
    create_date: { type: Date, default: Date.now }
});
var Image = mongoose.model("Image", imageSchema);
exports["default"] = Image;
