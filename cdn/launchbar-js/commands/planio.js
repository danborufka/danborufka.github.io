$(".updated_on") .after('<td><input class="lb_done" type="checkbox" /></i></td>'); $(document) .on('click', '.lb_done', function() { var id=0; console.log($(this).parent()); console.log($(this).parentsUntil('tr')); alert('Speicheeeern von Aufgabe #'+id+' !'); });