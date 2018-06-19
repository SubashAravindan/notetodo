$("#todolist").on("click","li",function () {
	$(this).toggleClass("completed");
})

$("#todolist").on("click","span",function(event)  {
	
	$(this).parent().fadeOut(500,function(){
		$(this).remove();
	});
	event.stopPropagation();
})

$("input[type='text']").keypress(function (event) {
	if (event.which===13) {
		var todoText=$(this).val();
		$("#todolist").append("<li><span><i class='fas fa-trash'></i></span> "+todoText+"</li>");
		$("input").val("");
	}
})

$("#saveBtn").click(()=>{
	var ob=[];
	$li=$("#todolist li");

	$li.each(function(index){
		var temp={"name":$($("#todolist li")[index]).text(),"completed":$($("#todolist li")[index]).hasClass("completed")}
		console.log(temp);
		ob.push(temp);
	})
	console.log(ob);
	$("#dummy").val(JSON.stringify(ob));
	$("#subBtn").trigger("click");	
})

