LAUNCHBAR.install({ commands: { check: function(slug) { var AD_NETWORKS={}; AD_NETWORKS.GDN= { name: "GDN Network", tags:["meta[name='ad.size'][value]" ], css: [["borderWidth", "1px"], ["borderColor", "black"] ], checks: function() { var check = true; check &= $("script[src*=edge]").attr('src').indexOf('adobe.com/runtime')<0; if(!check) alert('Edge runtime isn\'t included using a relative path'); $.ajax('index_edge.js') .done(function(data) { var check=(data.indexOf('window.open(')<0) && (data.indexOf('clicktag')<0); if(!check) alert('No clicktag defined!'); }); return check; } }; var netw=AD_NETWORKS[slug], check=true, $stage=$('#Stage'); netw.css.forEach(function(css) { var A=$stage.css(css[0]); check &= A == css[1]; if(!check) alert('CSS rule is missing:'+ css[0]+':'+ css[1]+'\nshould be:'+ A); }); netw.tags.forEach(function(tag) { check &= !!$(tag).length; if(!check) alert('HTML Tag is missing: <'+tag+'>'); }); } }, labels: { 'check': 'Checks banner for network compatibility' }}); LAUNCHBAR.commands.check('GDN');