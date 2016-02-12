if(GM_getValue('replace_issues') == undefined)
{
	GM_setValue('replace_issues', false);
}
if(GM_getValue('sort_issues') == undefined)
{
	GM_setValue('sort_issues', false);
}

if(location.href.match(/https?\:\/\/.*github\.com\/.*\/(issues([\/\?][^\d]+.*)?|milestones\/.*)$/))
jQuery(function($)
{
	var do_replaceIssues = GM_getValue('replace_issues');
	var my_user = 'danborufka';
	
    var $titles,
        search, filters = {}, milestones = {},
		issues = [],
		issue_numbers = {},
		filterString, 
        request,
		_keyChain = false;
    
	var PRIOS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

	var TMPL_SEARCHTERM = '<a href="//github.com/workflow/dropz/issues?q=%q%+%filters%" class="issue-title-link js-navigation-open">%title%:</a>';
	var TMPL_LABEL = '<a href="%url%" class="label labelstyle-%color% linked-labelstyle-%color% tooltipped tooltipped-n" style="background-color: #%color%; color: #fff;  text-shadow: rgba(0, 0, 0, 0.56) 1px 1px 2px; max-width: 100px; overflow: hidden; height: 18px; white-space:nowrap; text-overflow:ellipsis; %style%" aria-label="View all %name% issues">%name%</a>';
	var TMPL_ISSUE_TITLE = '<a href="%url%" class="issue-title-link js-navigation-open">%title% #%id%</a>';
	var TMPL_ISSUE_NR = '<strong>#%id%</strong> opened by <a href="%userUrl%">%userName%</a>';
	var TMPL_MILESTONE = '<a href="%html_url%">%title%</a>';	
	var TMPL_AVATAR = '<a href="%html_url%" aria-label="View everything assigned to %login%" class="tooltipped tooltipped-n"><img alt="@%login%" height="16" src="%avatar_url%" width="16"></a>';
	var TMPL_COMMENTS = '<a href="%html_url%" class="%class%"><span class="octicon octicon-comment"></span> %comments% </a>';
	
	var isShiftKey = false;

   
    function fillIn(tmpl, vars)
    {
        _.each(vars, function(val, key)
        {
            tmpl = tmpl.replace( new RegExp( '%' + key + '%', 'g') , val );
        });
        return tmpl;
    }
	function byAlphabet(a, b)
	{
		return $(a).find('.issue-title').text() > $(b).find('.issue-title').text() ? 1 : -1;
	}
	function byIssueNr(a, b)
	{
		return parseInt( $(a).find('.opened-by strong').text().slice(1) ) < parseInt( $(b).find('.opened-by strong').text().slice(1) ) ? 1 : -1;
	}
	function byUser(a, b)
	{
		if($(a).is('.mine')) return -1;
		if($(b).is('.mine')) return 1;
		
		var alt_a = $(a).find('.table-list-cell-avatar img').attr('alt'),
			alt_b = $(b).find('.table-list-cell-avatar img').attr('alt');
		
		if(!alt_a) return 1;
		if(!alt_b) return -1;
		
		return alt_a < alt_b ? 1 : -1;
	}
	function byPrio(a, b)
	{
		console.log('comparing prios:', $(a).data(), $(b).data());
		return $(a).data('prio') < $(b).data('prio') ? 1 : -1;
	}
	function sortIssues(by)
	{
		var $issues = $('.js-issue-row').sort(by);
		$issues.parent().append( $issues.detach() );
	}
    function innerHtml($tag)
    {
        return $('<div>').append($tag).html();
    }
    function updateFilter()
    {
		var F = _.mapValues(filters, function(filter, key)
		{
			if(filter.indexOf(',') > -1)
			{
				return filter.replace(/,/g, '&' + key + ':');
			}
			if(key === 'milestone' || key === 'label') return '"' + filter + '"';
			return filter;
		});
		
		filterString = $.param(F).replace(/=/g, ':').replace(/&/g, '+');
		/*$('#js-issues-search').val( decodeURIComponent( filterString )
								   .replace(/&/g,' ')
								   .replace(/([^\+:]+\+[^\s]+)+/g, '"$1"')
								   .replace(/((([^\+\s:]+)\+([^\+\s:]+)\+?)+)/, '$3 $4 ') 
								  );
		*/
	}
	
    function init( new_filters )
    {
        console.info("Issuemania (re)initialized.");
        
		filters = {};
		search = '';
		
        $titles = $('.issue-title-link');
        search = $('#js-issues-search').val().match(/(?:[^\s"]+|"[^"]*")+/g);
		
        filter_array = _.filter( search, function(s){ return s.indexOf(':') > -1; } );
        search = _.filter( search, function(s){ return s.indexOf(':') === -1; } );
		
		_.each(filter_array, function(filter, key)
        {
			var splits = filter.replace(/"/g, '').split(':');
			filter = splits.splice(0,1); 	// necessary in order to only 
			filter.push(splits.join(':'));	// regard the first colon
			
			if(filters[filter[0]])
				filters[filter[0]] = filters[filter[0]] + ',' + filter[1];
			else
				filters[filter[0]] = filter[1];
        });
		
		console.log('init Issuemania with', filter_array, filters, new_filters);
		
		_.each(new_filters, function(val, key)
		{
			filters[key] = val;
		});
		
		updateFilter();

		var data = {
            per_page: 900,
            milestone: (filters.milestone && milestones[filters.milestone] && milestones[filters.milestone].number) || '*',
			labels: (filters.label && filters.label.replace(/"/g, '')) || ''
        };
		
		if(filters.assignee)
			data.assignee = filters.assignee;
		
        request = {
            type:       'GET',
            url:        'https://api.github.com/repos/workflow/dropz/issues',
            dataType:   'json',
            headers: {
                "Authorization": "Basic " + btoa('danborufka:******')
            },
            data: data,
            success: function(results)
            {
                console.info(results.length, 'open issues (', results ,') found with filter');
                
				issues = results;
				issue_numbers = {};
				
                var $issues = $('.js-issue-row'),
					$container = $issues.parent(),
                    $tmpl_issue = $issues.eq(0).clone(),
                    $i, title, term;
								
				if(do_replaceIssues)
				{
					//clean up tmpl:
					$tmpl_issue.find('.table-list-cell-type').remove();
					$('.pagination').remove();
					
					$container.empty().append(
						_.map(results, function(issue)
						{
							issue_numbers[issue.number] = issue;
							
							if( search.length && ! issue.title.match(new RegExp( search.join('|'), 'g')) )
							{
								return '';
							}

							$i = $tmpl_issue.clone();

							title = issue.title;

							if( title.indexOf(':') > -1 )
							{
								title = title.split(':');
								term = title[0];
								//term = title[0].indexOf(' ') > -1 ? title[0].split(' ')[0] : title[0];

								var tmpl_a = fillIn(TMPL_SEARCHTERM, { q: term, filters: filterString, title: title[0] });

								title.shift();

								title = tmpl_a + fillIn(TMPL_ISSUE_TITLE, { url: issue.html_url, id: issue.number , title: _.rest(title).join(':') || title });
							}
							else
							{
								title = title + '\t#' + issue.number;
							}

							var todos = { unsolved: issue.body.match(/(?:\* \[ \] )([^\n\r]*)/g), solved: issue.body.match(/(?:\* \[x\] )([^\n\r]*)/g) };

							var prio = -1;

							//console.log('todos', todos.unsolved && todos.unsolved.length, 'unsolved', todos.solved && todos.solved.length, 'solved'); 

							if(issue.assignee)
								if(issue.assignee.login === my_user)
								{
									$i.css('background', 'rgba(255, 158, 0, 0.25)').addClass('mine');
								}
								else
								{
									var userColors = { allanlundhansen: 'rgba(0, 80, 128, 0.25)', workflow: 'rgba(0, 200, 158, 0.25)' };
									$i.css('background', userColors[issue.assignee.login] );
								}
							
							if( new Date(issue.updated_at) < (new Date()-1) )
								issue.class = 'muted-link';
							
							$i
								.find('.issue-title-link').empty().attr('href', issue.html_url ).html( title ).end()
								.find('.opened-by').empty().html( fillIn(TMPL_ISSUE_NR, {id: issue.number, userName: issue.user.login || '', userUrl: issue.user.html_url }) ).end()
								.find('.css-truncate-target').text( issue.milestone.title ).parent().attr('href', issue.milestone.html_url ).end().end()
								.find('.table-list-cell-avatar').html( ((issue.assignee && issue.assignee.login) || my_user) === my_user ? '' : fillIn(TMPL_AVATAR, issue.assignee) ).end()
								.find('.issue-comments').html( issue.comments ? fillIn(TMPL_COMMENTS, issue) : '' ).end()
								//.find('.task-progress').empty().end()
								.find('.labels').css('float', 'right').empty().append( 
									_.map( issue.labels, function( label )
									{
										var isPrio 	= label.name.match(/^prio/),
											name 	= label.name.replace(/^prio\:\s*/, ''),
											style 	= isPrio ? 'border-radius:20px; padding: 2px 20px; font-size:16px; float: right; margin-left: 20px;' : '';

											if(isPrio) 
											{
												prio = PRIOS.indexOf(name);
												console.log('prioName', name, prio, $i);
											}
										return fillIn( TMPL_LABEL, { color: label.color, name: name, url: label.url, style });
									}).join(' ')).end()
								.attr('data-prio', prio)
								[0].id = 'issue_' + issue.number;

							return innerHtml( $i );
						}).join('')
					);
				}; // do_replace
				
				var order = GM_getValue('sort_issues');
				if(order) 
				{
					switch(order)
					{
						case 'user':
							sortIssues(byUser);
							break;
						case 'abc':
							sortIssues(byAlphabet);
							break;
						case 'nr':
							sortIssues(byIssueNr);
							break;
						case 'prio':
							sortIssues(byPrio);
							break;
					}
				};	
            }
        };
        $.ajax(request);
    }
    
    (function(history){
    var pushState = history.pushState;
    history.pushState = function(state) {
        if (typeof history.onpushstate == "function") {
            history.onpushstate({state: state});
        }
        setTimeout(init, 1200);   
        return pushState.apply(history, arguments);
    }
    })(window.history);
    
	$.ajax({
		type:       'GET',
		url:        'https://api.github.com/repos/workflow/dropz/milestones',
		dataType:   'json',
		headers: {
			"Authorization": "Basic " + btoa('danborufka:g1t579#0a')
		},
		data: {per_page: 500},
		success: function(results)
		{
			_.each( results, function(result)
			{
				milestones[result.title] = result;
			});
			//console.log(milestones);
			init();
		}
	});
    
    $(document)
		.on('keydown', function(e)
		{
			if(e.keyCode === 16)
			{
				isShiftKey = true;
			}
		
			if(String.fromCharCode(e.which) === 'A' && _keyChain === 'O')
			{
				e.preventDefault();
				e.stopImmediatePropagation();
				return false;
			}
		})
		.on('keyup', function(e)
		{
			var $this = $(e.target);

			if(!($this.is(':input') || $this.is('textarea')))
			{
				switch(String.fromCharCode(e.which))
				{
					case 'Q':
						$(':input[name=q]').focus();
						break;
						
					case 'À':
						GM_setValue('replace_issues', !do_replaceIssues);
						location.reload();
						break;
					
					case 'O':

						_keyChain = 'O';
						
						e.preventDefault();
						e.stopImmediatePropagation();
						return false;
						
					case 'A':
						
						if(_keyChain == 'O')
						{
							_keyChain = false;
							
							GM_setValue('sort_issues', 'abc');
							sortIssues(byAlphabet);
							
							e.preventDefault();
							e.stopImmediatePropagation();
							return false;
						}
						break;

					case 'P':

						if(_keyChain == 'O')
						{
							_keyChain = false;
							
							GM_setValue('sort_issues', 'prio');
							sortIssues(byPrio);
							
							e.preventDefault();
							e.stopImmediatePropagation();
							return false;
						}
						break;
						
					case 'Ü':
						
						if(_keyChain == 'O')
						{
							_keyChain = false;
							GM_setValue('sort_issues', 'nr');
							sortIssues(byIssueNr);
						}
						break;
						
					case 'U':
						
						if(_keyChain == 'O')
						{
							_keyChain = false;
							GM_setValue('sort_issues', 'user');
							sortIssues(byUser);
						}
						break;
						
					default:
						
						isShiftKey = false;
						_keyChain = false;
				}
			}
		})
		.on('click', '.label', function()
		{
			filters.label = $(this).text();
			updateFilter();

			console.log('//github.com/workflow/dropz/issues?' + filterString);
		
			window.location.href = '//github.com/workflow/dropz/issues?' + filterString;
			//$('#js-issues-search').parent().submit();
			return false;
		});
});
