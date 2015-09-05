import * as mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/test');

let Schema = mongoose.Schema;
let imageSchema: mongoose.Schema = new Schema({
	title : String,
	name : String,
	source : String,
	create_date : {type: Date, default: Date.now}
});

let Image: mongoose.Model<mongoose.Document> = mongoose.model("Image", imageSchema);

export default Image;