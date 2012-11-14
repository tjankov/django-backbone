(function ($) {
	
	/////////////////
	
	var BaseView = function (options) {
	    this.bindings = [];
	    Backbone.View.apply(this, [options]);
	};

	_.extend(BaseView.prototype, Backbone.View.prototype, {
	
	    bindTo: function (model, ev, callback) {
	
	        model.bind(ev, callback, this);
	        this.bindings.push({ model: model, ev: ev, callback: callback });
	    },
	
	    unbindFromAll: function () {
	        _.each(this.bindings, function (binding) {
	            binding.model.unbind(binding.ev, binding.callback);
	        });
	        this.bindings = [];
	    },
	
	    dispose: function () {
	        this.unbindFromAll(); // this will unbind all events that this view has bound to 
	        this.unbind(); // this will unbind all listeners to events from this view. This is probably not necessary because this view will be garbage collected.
	        this.remove(); // uses the default Backbone.View.remove() method which removes this.el from the DOM and removes DOM events.
	    }
	
	});
	
	BaseView.extend = Backbone.View.extend;
	
	////////////////
	
	window.bckb_manager = function(){
	   this.register = function(view) {
	    if (this.currentView){this.currentView.dispose();}	
	   this.currentView = view;	
	  }	
	}

	/////////////////
	
	var dp_loaded = false;
	var csrfToken = $('input[name=csrfmiddlewaretoken]').val();
	
	$(document).ajaxSend(function(e, xhr, settings) {
	    xhr.setRequestHeader('X-CSRFToken', csrfToken);
	});
	
	function formToJson(jq_form){
		    var f = {};
		    var a = jq_form.serializeArray();
		    $.each(a, function() {				
		        if (f[this.name] !== undefined) {
		            if (!f[this.name].push) {
		                f[this.name] = [f[this.name]];
		            }
		            f[this.name].push(this.value || '');
		        } else {
		            f[this.name] = this.value || '';
		        }		        
		    });;
		    //~ // swapping day & month place in date_due string - no form.cleaned_data
		    if(/^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}$/.test(f.date_due) && String(new Date(f.date_due)) !== "Invalid Date")
		    {f.date_due = f.date_due.substring(3,5) + '/' + f.date_due.substring(0,2) + '/' + f.date_due.substring(6)}
		    else {f.date_due = ''}
		    f.user = "/rest/v1/user/" + userId + "/";
		    return f;
	};
	
	function menu(){	
			$('#topnav li.hov').removeClass('hov current').find("p").remove();
			var $el, route = Backbone.history.fragment;	
		    if ((route == "") || (route == "create/")){
			    if (route == ""){$el = $('#topnav li#t_index');} else {$el = $('#topnav li#t_create');}
			    if ($el.hasClass('hov')) {
			        return;
			    } else {
			        $el.addClass('hov current').append("<p>"+ $el.attr("title") + "</p>");
			    }
			}			
	}

	// vraća dd/mm/yyyy string iz time varijable
	function dateFromString(string){
		if (string !== ""){
			time = new Date(string);
			if (time.getDate() < 10) { var date = '0' + time.getDate();} else { var date = time.getDate(); }
			var month = time.getMonth() + 1; if (month < 10) { var month = '0' + month;}
			time = date + '/' + month + '/' + time.getFullYear();
			return time;
	    }
	};
	
	
	function getStatus(date_due){
			var now = new Date();
			var due = new Date(date_due);
			if ((now.getFullYear() == due.getFullYear()) && (now.getMonth() == due.getMonth()) && (now.getDate() == due.getDate())){return "due";}
			else if (now > due){return "inactive";}
			else if (now < due){return "active";}
	};

	var Todo = Backbone.Model.extend({ 
		urlRoot: '/rest/v1/todo/',		
		url: function(){return this.get('resource_uri') || this.urlRoot + (this.id !== undefined ? this.id + '/' : '');},	
		validate: function(todo) {	// validacija - samo 4 polja koja ne smiju biti prazna
			var requireds = ['title', 'text', 'priority', 'date_due'];
			var invalids = _.filter(requireds, function(item){ 
				return todo[item] === ''; 
			});
			var valids = _.filter(requireds, function(item){ return todo[item] !== ''; });
			if (invalids.length > 0){return [invalids, valids];}
		},

		initialize: function(){	// validacija - označavanje krivih inputa	
			this.bind("error", function(model, error){

				_.each(error[0], function(item){ 
					$("label.l_"+item).css({'color':'#c51'});				
				});
				_.each(error[1], function(item){ 
					$("label.l_"+item).css({'color':'#ccc'});				
				});
				$("#todo-form .note").css({'color':'#c51'});
			});				
		},
		

			

	});

    var Collection = Backbone.Collection.extend({
		model: Todo,
		url: '/rest/v1/todo/?limit=0',
		parse: function(data){return data.objects;} 
	});
	
	
	var TodoView = BaseView.extend({
		tagName: 'tr',
		className: 'todo_row',		
		template: $("#todoTemplate").html(),
		render: function(){
			var todo = this.model.toJSON();
			todo.status = getStatus(todo.date_due);
			todo.date_due = dateFromString(todo.date_due);			
			var tmpl = _.template(this.template);
			todo.priority_arr = ['low','normal','high'];
			$(this.el).html(tmpl(todo)).attr({'class': todo.status});
			return this;
		},    
		
		events: {
			"click .del": "destroyTodo",
		},  
		
		destroyTodo: function(event){
			var that = this;
			if(confirm('Are you sure you want to delete this item?')){
				this.model.destroy({success: function(model, response) {
					that.dispose();
					alert('You have successfully deleted the item!');
				}});							
			}
		},     
		
		                             
	});
	

	var pageView = BaseView.extend({
		initialize: function () {
			_.bindAll(this, 'render');
			dir_collection = new Collection();
			dir_collection.bind('all', this.render);
			dir_collection.fetch();
		},


			
		
	
		render: function () {
			if (dir_collection.length == 0){ $("#t_home").hide(); $("#t_add").hide(); app.navigate("create/", {trigger:true, replace: true});} else {
				var that = this;	
				var tmpl = _.template($("#indexTemplate").html());
				$(this.el).html(tmpl());
				$("#cont").html(this.el);			
				_.each(dir_collection.models, function(v, k){			
						single_view = that.renderTodo(v);
						$('#todotable').append(single_view.el);			
				});			
				$("#logo").html("Todo list");

			}	          
		},
		
	
		renderTodo: function (item, count) {
			var todoView = new TodoView({
				model: item,
				id: "todo_" + item.id,
			});
			return todoView.render();
		},
		
			
	});
	

	var detailView = BaseView.extend({
		template: $("#detailTemplate").html(),
		
		initialize: function () {
			_.bindAll(this,'render');
			this.model.bind('change', this.render);
			this.model.fetch();
		},	
					
		render: function () {
			var todo = this.model.attributes;
			priority_arr= ['low','normal','high'];	
			var tmpl = _.template(this.template);
			todo.status = getStatus(todo.date_due);
			todo.date_due = dateFromString(todo.date_due);
			todo.arr = priority_arr;			
			$(this.el).html(tmpl(todo));
			$("#cont").html(this.el);		
			$("#logo").html("Todo #" + todo.id + " details");		
			$("#item_menu a").hover(function(){$(this).toggleClass('it_hov');});
		},	
		
		events: {
			"click .delete": "destroyTodo",
		},  
		
		destroyTodo: function(event){
			var that = this;
			if(confirm('Are you sure you want to delete this item?')){
				this.model.destroy({success: function(model, response) {
					app.navigate("", {trigger: true, replace: true});
					alert('You have successfully deleted the item!');
				}});							
			}
		}, 	
	});
	
	var createView = BaseView.extend({	
		initialize: function(){	
		},
		render: function () {
			var tmpl = _.template($("#createTemplate").html());				
			$(this.el).html(tmpl());
			$("#cont").html(this.el);
			$("#logo").html("Create Todo");	
			// DATEPICKER
			if (!dp_loaded){
				$("head").append("<link rel='stylesheet' type='text/css' href='/static/css/jquery-ui-1.9.1.custom.min.css' />");
				$.getScript("/static/js/jquery-ui-1.9.1.custom.min.js", function() {	
					$('#Todo_date_due').datepicker({'minDate':'0','dateFormat':'dd/mm/yy'});
				});										
				dp_loaded = true;
			} else {$('#Todo_date_due').datepicker({'minDate':'0','dateFormat':'dd/mm/yy'});}
			
			
			


		},
		
				
		events: {
			"click #btn_create": "create_Todo",
		},
		
		create_Todo: function(event){
			var form = $("#todo-form");
			var data = formToJson(form);
			var todo = new Todo();
			var s = todo.save(data,
			{
				success: function(model, response){	
					var resource = s.getResponseHeader('Location');
					var id = window.corr = resource.split("/")[6];
					app.navigate("view/" + id, {trigger: true, replace: true});						
				}
			});				
		},
	});
	
	var updateView = BaseView.extend({	
		render: function () {			
			var todo = this.model.attributes;
			todo.arr = ['low','normal','high'];				
			todo.date_due = dateFromString(todo.date_due);
			var tmpl = _.template($("#editTemplate").html());					
			$(this.el).html(tmpl(todo));
			$("#cont").html(this.el);	
			$("#logo").html("Edit Todo #" + todo.id);	
			// DATEPICKER
			if (!dp_loaded){
				$("head").append("<link rel='stylesheet' type='text/css' href='/static/css/jquery-ui-1.9.1.custom.min.css' />");
				$.getScript("/static/js/jquery-ui-1.9.1.custom.min.js", function() {	
					$('#Todo_date_due').datepicker({'minDate':'0','dateFormat':'dd/mm/yy'});
				});										
				dp_loaded = true;
			} else {$('#Todo_date_due').datepicker({'minDate':'0','dateFormat':'dd/mm/yy'});}
		},
		
				
		events: {
			"click #btn_update": "update_Todo",
			"click .delete": "destroyTodo",
		},
		
		update_Todo: function(event){
			var form = $("#todo-form");
			var data = formToJson(form);
			console.log(data.date_due);
			var todo = this.model;
			var s = todo.save(data,
			{
				success: function(model, response){	
					var id = model.id;
					app.navigate("view/" + id, {trigger: true, replace: true});										
				}
			});				
		},
		
		destroyTodo: function(event){
			var that = this;
			if(confirm('Are you sure you want to delete this item?')){
				this.model.destroy({success: function(model, response) {
					app.navigate("", {trigger: true, replace: true});
					alert('You have successfully deleted the item!');
				}});							
			}
		}, 
	});
	
	var AppRouter = Backbone.Router.extend({	
	    routes: {
	        ""                  : "index",
	        "view/:item"		: "viewTodo",
	        "create/"			: "createTodo",
	        "update/:item"		: "updateTodo"
	    },
	    
	    initialize: function(options){
			this.manager = window.m = options.manager;
		},
		
		

	    	        
		index: function(){directory = new pageView(); this.manager.register(directory);},		
		viewTodo: function(item){var todo = new detailView({model: new Todo({id: Number(item)}) });  this.manager.register(todo);},		
		createTodo: function(){var todo = new createView({model: new Todo()}); todo.render();  this.manager.register(todo);},					
		updateTodo: function(item){  
				var that = this;
				var dModel = new Todo({id: Number(item)});
			    dModel.fetch({success:function(){
				    var todo = new updateView({model: dModel });
					todo.render();	
					that.manager.register(todo);
				}});							
		},
		
			
	});	




    app = new AppRouter({manager: new window.bckb_manager()});
    Backbone.history.start();
    Backbone.history.bind("all", function () { menu();});
    menu();
    $("#topnav li").on("mouseenter", function(event){ if (!$(this).hasClass("hov")){$(this).addClass('hov').append("<p>"+ $(this).attr("title") + "</p>");}});
    $("#topnav li").on("mouseleave", function(event){ if (!$(this).hasClass("current")){$(this).removeClass('hov').find("p").remove();}});
} (jQuery));
