import * as mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/test');

let Schema = mongoose.Schema;
let imageSchema: mongoose.Schema = new Schema({
	title : String,
	name : String,
	source : String,
	create_date : {type: Date, default: Date.now}
});

// 分页参数接口
interface Paging{
    limit: number;
    num: number;
    pageCount?: number;
    size?: number;
    numberOf?: number;
}

let Image: mongoose.Model<mongoose.Document> = mongoose.model("Image", imageSchema);

Image.findByPage = function (page: Paging): Array<{}> {
	let res = this.find().sort('_id').skip(page.num * page.limit - page.limit).limit(page.limit).exec(function (err, results): Array<{}> {
		if(err){
            console.log(err);
			return [page];
        } else {
            let resPage: Paging = this.count({},function(error, count){
                if(error){
                    console.log(error);
					return page;
                } else {
                    var pageCount = Math.ceil(count / page.limit);
                    page.pageCount = pageCount;
                    page.size = results.length;
                    page.numberOf = pageCount > 5 ? 5 : pageCount;
                    return page;                
                }
            });
            
            let resObj:Array<{}> = [resPage, results];
            return resObj;
        }
	});
    return res;
}

export default Image;