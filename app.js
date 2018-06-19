    var express  = require("express"),
            app  = express(),
     // bodyParser  = require("body-parser"),
          mysql  = require("mysql"),
     connection  = require("./sql/connect.js"),
methodOverride   = require("method-override"),
expressSanitizer = require("express-sanitizer"),
         multer  = require('multer'),
        session  = require('express-session'),
         bcrypt  = require("bcrypt"),
    cookieParser = require('cookie-parser'),
          upload = multer({ dest: 'uploads/' });


app.set("view engine","ejs");

// app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.use(express.static(__dirname+"/uploads"));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(session({ 
	secret: 'sshhhhhhhhhhhh SECREETTT',
	saveUninitialized:true,
	resave:false,
	 cookie: { maxAge: 60000000 }
}));
app.use(cookieParser());
app.use((req,res,next)=>{
	res.locals.username=req.session.username;
	next();
});

	

//========================================================================================================
//ROUTES
//========================================================================================================
app.get("/",isLoggedIn,(req,res)=>{
	res.redirect("/items");	
})

//INDEX ROUTE
//================================

app.get("/items",isLoggedIn,(req,res)=>{
	connection.query("SELECT * FROM items WHERE item_id IN (SELECT item_id FROM permission_table WHERE user_id = ?)",[req.session.user_id],(err,result)=>{
		if (err) {
			console.log(err);
		}
		else{
			labels=[];
			result.forEach(item=>{
				labels.push(item.label)
			})
	 		res.render("items",{items:result,labels:labels,css:null});		
		}
	})

})

//NEW ROUTE
//================================

app.get("/items/new",isLoggedIn,(req,res)=>{
	res.render("new",{css:null});
})

//CREATE ROUTE
//================================

app.post("/items",upload.single('image'),(req,res)=>{
	console.log(req.file);
	var fn;
	if (req.file) {
		if (!(req.file.mimetype==="image/jpeg"||req.file.mimetype==="image/jpg"||req.file.mimetype==="image/png")) {
			alert("file is not image");
			res.redirect("/items/new");
		}
		fn=req.file.filename;
	} 
	var qry="INSERT INTO items VALUES( NULL,?,?,?,?,?,?,?,?)";
	connection.query(qry,[fn,req.body.type,req.body.label,new Date(Date.now()),new Date(Date.now()),req.body.title,req.body.type==="Note"?req.body.content:"[]",req.body.priority],(err,result)=>{
		if(err){
			console.log(err)
		}
		else{
			console.log(result);
			connection.query("INSERT INTO permission_table VALUES (?,?)",[req.session.user_id,result.insertId],(err,re)=>{
				if (err) {
					console.log(err);
				} else {
					res.redirect("/items/"+result.insertId);
				}
				
			})			
		}
		
	})
	console.log(req.file);
})

//SHOW ROUTE
//================================

app.get("/items/:id",isLoggedIn,hasAccessTo,(req,res)=>{
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

app.get("/items/:id/edit",isLoggedIn,hasAccessTo,(req,res)=>{

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

app.put("/items/:id",isLoggedIn,hasAccessTo,upload.single('image'),(req,res)=>{

	qry="SELECT type FROM items WHERE item_id= ?";
	connection.query(qry,[req.params.id],(err,result1)=>{
		if (err) {
			console.log(err);
		} else  {
			//EDIT NOTE
			if (result1[0].type==="Note") {

				var fn;
				if (req.file) {
					if (!(req.file.mimetype==="image/jpeg"||req.file.mimetype==="image/jpg"||req.file.mimetype==="image/png")) {
						alert("file is not image");
						res.redirect("/items/new");
					}
					fn=req.file.filename;
				} 
				qry="UPDATE items SET image = ?, title = ? ,content = ?, priority = ?, label = ?, edited = ? WHERE item_id = ?";
				connection.query(qry,[fn,req.body.title,req.body.content,req.body.priority,req.body.label,new Date(Date.now()),req.params.id],(err,result)=>{
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

app.delete("/items/:id",isLoggedIn,hasAccessTo,upload.array(),(req,res)=>{
	qry="DELETE FROM items WHERE item_id = ?";
	connection.query(qry,[req.params.id],(err,result)=>{
		if (err) {
			console.log(err)
		} else {
			connection.query("DELETE FROM permission_table WHERE item_id = ?",[req.params.id],(err,result)=>{
				res.redirect("/items");
			})			
		}
	})
})

//===================================================
//AUTH ROUTES
//===================================================




//LOGIN FORM
//===============================

app.get('/login',(req,res)=>{
	res.render("login",{css:null});
})

//LOGIN SUBMIT
//===============================

app.post("/login",upload.single(),(req,res)=>{
	qry="SELECT * FROM users WHERE username = ?";
	connection.query(qry,[req.body.username],(err,result)=>{
		if (err) {
			console.log(err)
		} else {
			if (result.length) {
				bcrypt.compare(req.body.password, result[0].password, function(err, resu) {
					if (err) {
						console.log(err);
					} else {
						if (resu===true) {
							res.redirect("/items");
							req.session.username=req.body.username;
							req.session.user_id=result[0].user_id;
							req.session.save();
						} else {
							res.redirect("/login");
						}
					}
				});
			} else {
				res.redirect("/signup");
			}
		}
	})
})

app.get('/signup',(req,res)=>{
	res.render("signup",{css:null})
})

//SIGN UP
//===============================

app.post('/signup',upload.single(),(req,res)=>{
	req.session.destroy();
	qry="SELECT * FROM users WHERE username = ?";
	connection.query(qry,[req.body.username],(err,result)=>{
		if (err) {
			console.log(err)
		} else {
			if (result.length) {
				res.send("user with the username already exists<a href='/signup'>Signup again</a>");
				// res.redirect("/signup");
			} else {
				qry="INSERT INTO users VALUES(NULL,?,?)";
				bcrypt.hash(req.body.password, 5, function(err, hash) {
					if (err) {
						console.log(err);
						res.redirect("/signup");
					}
					connection.query(qry,[req.body.username,hash],(err,result)=>{
						if (err) {
							console.log(err)
						} else {
							res.redirect("/login");		
						}
					})
				});

			}
		}
	})

})

//LOGOUT
//===============================

app.get("/logout",(req,res)=>{
	req.session.destroy();
	res.redirect("/login");
})

//LOG IN CHECK MIDDLEWARE
//===========================================

function isLoggedIn(req,res,next){
	if (req.session.username) {
		return next();
	} else {
		res.redirect("/login");
	}
}


//===============================================================================
// ACCESS ROUTES
//===============================================================================

app.get("/items/:id/access",isLoggedIn,hasAccessTo,(req,res)=>{
	connection.query("SELECT * FROM users WHERE user_id IN (SELECT user_id FROM permission_table WHERE item_id = ?)",[req.params.id],(err,result)=>{
		if (err) {
			console.log(err);
		} else {
			res.render("access",{item_id:req.params.id,users: result,css:null});
		}
	})
})

//GRANT ACCESS
//=============================

app.post("/items/:id/access/add",isLoggedIn,hasAccessTo,upload.single(),(req,res)=>{
	connection.query("SELECT * FROM users WHERE username = ?",[req.body.username],(err,resu)=>{
		if (err) {
			console.log(err)
		} else {
			connection.query("INSERT INTO permission_table VALUES(?,?)",[resu[0].user_id,req.params.id],(err,result)=>{
				if (err) {
					console.log(err);
				} else {
					res.redirect("/items/"+req.params.id+"/access");
				}
			})				
		}
	})

})

//REMOVE ACCESS
//==============================================================
app.get("/items/:id/access/remove/:id2",isLoggedIn,hasAccessTo,(req,res)=>{
	connection.query("DELETE FROM permission_table WHERE user_id = ? AND item_id = ?",[req.params.id2,req.params.id],(err,result)=>{
		if (err) {
			console.log(err)
		} else {
			res.redirect("/items/"+req.params.id+"/access");
		}
	})
})

//ACCESS CHECKING MIDDLEWARE
//=====================================

function hasAccessTo(req,res,next){
	connection.query("SELECT * FROM permission_table WHERE user_id = ? AND item_id = ?",[req.session.user_id,req.params.id],(err,result)=>{
		if (result.length) {
			return next();
		}
		else {
			res.send("ACCESS DENIED")
		}
	})
}

app.listen(3000,()=>{
	console.log("Server started")
})