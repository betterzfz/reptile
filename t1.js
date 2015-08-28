(function () {
var d = document,
w = window,
p = parseInt,
dd = d.documentElement,
db = d.body,
dc = d.compatMode == 'CSS1Compat',
dx = dc ? dd: db,
ec = encodeURIComponent;
w.CHAT = {
msgObj:d.getElementById("message"),
screenheight:w.innerHeight ? w.innerHeight : dx.clientHeight,
username:null,
userid:null,
socket:null,
        touid:null,
        fromuid:null,
//让浏览器滚动条保持在最低部
scrollToBottom:function(){
w.scrollTo(0, this.msgObj.clientHeight);
},
//退出
logout:function(){
//this.socket.disconnect();
location.reload();
},
//提交聊天消息内容
submit:function(){
var content = d.getElementById("content").value;
if(content != ''){
var obj = {
                    userid: this.userid,
                    username: this.username,
content: content,
                    touid: this.touid,
                    fromuid: this.fromuid
};
var ss = this.socket.emit('message', obj);
               /* for(var p in ss){
                    alert(p+'    '+ss[p]);
                }*/
//当连接socket失败的时候执行
                if(ss.disconnected == true){
                    var contentDiv = '<div>'+obj.content+'send fail</div>';
                    var usernameDiv = '<span>'+obj.username+'</span>';
                    var section = d.createElement('section');
                        section.className = 'user';
                        section.innerHTML = contentDiv + usernameDiv;
                        CHAT.msgObj.appendChild(section);
                        CHAT.scrollToBottom();
                }
d.getElementById("content").value = '';
}
return false;
},
genUid:function(){
return new Date().getTime()+""+Math.floor(Math.random()*899+100);
},
//更新系统消息，本例中在用户加入、退出的时候调用
updateSysMsg:function(o, action){
//当前在线用户列表
var onlineUsers = o.onlineUsers;
//当前在线人数
var onlineCount = o.onlineCount;
//新加入用户的信息
var user = o.user;
//更新在线人数
var userhtml = '';
var separator = '';
for(key in onlineUsers) {
       if(onlineUsers.hasOwnProperty(key)){
userhtml += separator+onlineUsers[key];
separator = '、';
}
   }
d.getElementById("onlinecount").innerHTML = '当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml;
//添加系统消息
var html = '';
html += '<div class="msg-system">';
html += user.username;
html += (action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室';
html += '</div>';
var section = d.createElement('section');
section.className = 'system J-mjrlinkWrap J-cutMsg';
section.innerHTML = html;
this.msgObj.appendChild(section);
this.scrollToBottom();
},
init:function(username,touid,fromuid){
this.userid = this.genUid();
this.username = username;
            this.touid = touid;
            this.fromuid = fromuid;
d.getElementById("showusername").innerHTML = this.username;
this.msgObj.style.minHeight = (this.screenheight - db.clientHeight + this.msgObj.clientHeight) + "px";
this.scrollToBottom();
//连接websocket后端服务器
this.socket = io.connect('http://localhost:8080');
//告诉服务器端有用户登录
//alert('userid:'+this.userid +', username:'+this.username);
this.socket.emit('login', {userid:this.userid, username:this.username});
//监听新用户登录
this.socket.on('login', function(o){
CHAT.updateSysMsg(o, 'login');
});
//监听用户退出
this.socket.on('logout', function(o){
CHAT.updateSysMsg(o, 'logout');
});
            //监听私聊消息发送
            this.socket.on('to'+this.fromuid, function(obj){
                var contentDiv = '<div>'+obj.content+'</div>';
                var usernameDiv = '<span>'+obj.username+'</span>';
                var section = d.createElement('section');
                if(obj.fromuid == CHAT.fromuid && obj.touid == CHAT.touid){
                    section.className = 'user';
                    section.innerHTML = contentDiv + usernameDiv;
                    CHAT.msgObj.appendChild(section);
                    CHAT.scrollToBottom();
                }
                if(obj.touid ==CHAT.fromuid && obj.fromuid == CHAT.touid){
                    section.className = 'service';
                    section.innerHTML = usernameDiv + contentDiv;
                    CHAT.msgObj.appendChild(section);
                    CHAT.scrollToBottom();
                }
            });
}
};
//通过“回车”提交信息
d.getElementById("content").onkeydown = function(e) {
e = e || event;
if (e.keyCode === 13) {
CHAT.submit();
}
};
})();