document.ready = function(f){
    if (this.attachEvent ? this.readyState === "complete" : this.readyState !== "loading"){
        f();
    } else {
        this.addEventListener('DOMContentLoaded', f);
    }
};

String.prototype.toDOM = function(){
    var d = document, i, a = d.createElement("div"), b = d.createDocumentFragment();
    a.innerHTML=this;
    while(i = a.firstChild) {
        b.appendChild(i);
    }
    return b;
};

function Findable() {
    this.createEmbeddButton = function() {
        return '<a class="btn btn-primary"><i class="glyphicon glyphicon-ok" style="padding-right: 5px;"></i>Apply</a>';
    };

    this.getBootstrapCDN = function() {
        return '<link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" type="text/css" rel="stylesheet">';
    };

    this.hasBootstrap = function() {
        var result = false,
            links = document.querySelectorAll('link'),
            href = '';

        Array.prototype.forEach.call(links, function(el, i){
            href = el.getAttribute('href') || '';
            if(href.indexOf('bootstrap') > -1) {
                result = true;
            }
        });

        return result;
    };

    this.injectBootstrap = function() {
        var h = document.getElementsByTagName('head')[0];
        h.appendChild(this.getBootstrapCDN().toDOM());
    };

    this.sendApplication = function(event){
        event.preventDefault();
        event.stopPropagation();

        var id = this.getAttribute('data-id');
        
        alert('Appliying to business ' + id);
    }
}

var findableSDK = new Findable();

document.ready(function(){
    if(!findableSDK.hasBootstrap()) {
        findableSDK.injectBootstrap();
    }

    var embeddable = document.querySelectorAll('.findable-embedded'), embedded = document.createElement('div');
    Array.prototype.forEach.call(embeddable, function(el, i){
        el.addEventListener('click', findableSDK.sendApplication);
        el.appendChild(findableSDK.createEmbeddButton().toDOM());
    });
});