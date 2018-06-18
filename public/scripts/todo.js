$("ul").on("click","li",function () {
	$(this).toggleClass("completed");
})

$("ul").on("click","span",function(event)  {
	
	$(this).parent().fadeOut(500,function(){
		$(this).remove();
	});
	event.stopPropagation();
})

$("input[type='text']").keypress(function (event) {
	if (event.which===13) {
		var todoText=$(this).val();
		$("ul").append("<li><span><i class='fas fa-trash'></i></span> "+todoText+"</li>");
		$("input").val("");
	}
})

$("#saveBtn").click(()=>{
	var ob=[];
	$li=$("li");

	$li.each(function(index){
		var temp={"name":$($("li")[index]).text(),"completed":$($("li")[index]).hasClass("completed")}
		console.log(temp);
		ob.push(temp);
	})
	console.log(ob);
	$("#dummy").val(JSON.stringify(ob));
	$("#subBtn").trigger("click");	
})

