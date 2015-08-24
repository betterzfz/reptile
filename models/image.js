var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var ImageSchema = new Schema({
	title : String,
	name : String,
	create_date : {type: Date, default: Date.now},
	update_date : {type: Date, default: Date.now},
});
var Image = mongodb.mongoose.model("Image", ImageSchema);
module.exports = Image;