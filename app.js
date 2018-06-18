var express  = require("express"),
        app  = express(),
 bodyParser  = require("body-parser"),
      mysql  = require("mysql"),
 connection  = require("./sql/connect.js"),
 methodOverride   = require("method-override"),
expressSanitizer = require("express-sanitizer");
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.use(expressSanitizer());
app.use(methodOverride("_method"));



//========================================================================================================
//ROUTES
//========================================================================================================
app.get("/",(req,res)=>{
	res.redirect("/items");	
})

//INDEX ROUTE
//================================

app.get("/items",(req,res)=>{
	connection.query("SELECT * FROM items",(err,result)=>{
		if (err) {
			console.log(err);
		}
		else{
	 		res.render("items",{items:result,css:null});		
		}
	})

})

//NEW ROUTE
//================================

app.get("/items/new",(req,res)=>{
	res.render("new",{css:null});
})

//CREATE ROUTE
//================================

app.post("/items",(req,res)=>{
	var qry="INSERT INTO items VALUES( NULL,?,?,?,?,?,?,?)";
	connection.query(qry,[req.body.type,req.body.label,new Date(Date.now()),new Date(Date.now()),req.body.title,req.body.type==="Note"?req.body.content:[],req.body.priority],(err,result)=>{
		if(err){
			console.log(err)
		}
		else{
			console.log(result);
			res.redirect("/items/"+result.insertId);
		}
		
	})
})

//SHOW ROUTE
//================================

app.get("/items/:id",(req,res)=>{
	var qry='SELECT * FROM items WHERE item_id = ' + mysql.escape(req.params.id);
	connection.query(qry,(err,result)=>{
		if (err) {
			console.log(err);
		}
		else{
			
			if (result[0].type==="Note") {

				res.render("note",{item:result[0],css:"note"});
			}
			 else {
				res.render("todo",{item:result[0],css:"todo"});
			}				
		}
	})
})

//EDIT ROUTE
//================================

app.get("/items/:id/edit",(req,res)=>{

	var qry='SELECT * FROM items WHERE item_id = ' + mysql.escape(req.params.id);
	connection.query(qry,(err,result)=>{
		if (err) {
			console.log(err);
		}
		else if (result[0].type!="Note") {
			res.redirect("/items/"+result[0].item_id);
		}else{
			res.render("edit",{item:result[0],css:null});				
		}
	})	
	
})

//UPDATE ROUTE
//================================

app.put("/items/:id",(req,res)=>{

	qry="SELECT type FROM items WHERE item_id= ?";
	connection.query(qry,[req.params.id],(err,result1)=>{
		if (err) {
			console.log(err);
		} else  {
			//EDIT NOTE
			if (result1[0].type==="Note") {
				qry="UPDATE items SET title = ? ,content = ?, priority = ?, label = ?, edited = ? WHERE item_id = ?";
				connection.query(qry,[req.body.title,req.body.content,req.body.priority,req.body.label,new Date(Date.now()),req.params.id],(err,result)=>{
					if (err) {
						console.log(err);
					} else {
						res.redirect("/items/"+req.params.id);	
					}
				})
			} else {
				//EDIT TODO
				qry='UPDATE items SET content = ?, edited= ? WHERE item_id = ?';
				connection.query(qry,[req.body.dummy,new Date(Date.now()),req.params.id],(err,result)=>{
					if (err) {
						console.log(err);
					}
					else{
						console.log(result);
						res.redirect("/items/"+req.params.id);		
					}
				})
			}
		}
	})
})

//DELETE ROUTE
//================================

app.delete("/items/:id",(req,res)=>{
	qry="DELETE FROM items WHERE item_id = ?";
	connection.query(qry,[req.params.id],(err,result)=>{
		if (err) {
			console.log(err)
		} else {
			res.redirect("/items")
		}
	})
})


app.listen(3000,()=>{
	console.log("Server started")
})