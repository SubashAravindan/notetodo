var mysql  = require("mysql");

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'username',
  password : 'Password1234*',
});

connection.connect((err)=>{
	if (err) {
		console.log(err);
	}
	else{
		console.log('mysql connected')
	}
	
})

connection.query("CREATE DATABASE IF NOT EXISTS notetododb",(err,result)=>{
	if(err){
		console.log(err);
	}

});
connection.end();

connection = mysql.createConnection({
host     : 'localhost',
user     : 'username',
password : 'Password1234*',
database : 'notetododb'
});

connection.connect((err)=>{
	if (err) {
		console.log(err);
	}
	else{
		console.log('mysql connected to database')
	}
	
})
connection.query("CREATE TABLE IF NOT EXISTS items (item_id INT AUTO_INCREMENT PRIMARY KEY,type VARCHAR(20),label VARCHAR(100),created DATETIME,edited DATETIME,title VARCHAR(100),content VARCHAR(1000),priority int)",(err,result)=>{
	if (err) {
		console.log(err);
	}
})

//seed
items=[
	{
		type:"Todo List",
		created:new Date(Date.now()),
		edited:new Date(Date.now()),
		priority : "2",
		label :"official",
		title:"To Do List 1",
		content: JSON.stringify([{name:"task 1",completed:false},{name:"task 2",completed:true}])
	},
	{
		type:"Note",
		title:"My first note",
		created: new Date(Date.now()),
		edited: new Date(Date.now()),
		priority : "1",
		label :"unofficial",
		content:"lorem ipsum susyta assahjaj asdgygasguda asuyasgasd asyag asbcbabca asutuquyge acsbcjabca asdygasgd"
	},
	{
		type:"Todo List",
		created:new Date(Date.now()),
		edited:new Date(Date.now()),
		priority : "3",
		label :"official",
		title:"To Do List 2",
		content: JSON.stringify([{name:"task 1",completed:false},{name:"task 2",completed:false}])
	}
];

items.forEach((item)=>{
	connection.query("INSERT INTO items VALUES(NULL,?,?,?,?,?,?,?)",[item.type,item.label,item.created,item.edited,item.title,item.content,item.priority],(err,result)=>{
	// connection.query("INSERT INTO items VALUES ( NULL" +","+item.type+","+item.label+",NOW(),NOW()," + item.title +","+item.content+","+item.priority+")",(err,result)=>{
		if (err) {
			console.log(err)
		}
		else{

		}
	})
})

module.exports=connection;