$(".updated_on") .after('<td><input class="lb_done" type="checkbox" /></i></td>'); $(document) .on('click', '.lb_done', function() { var id=parseInt($(this).parentsUntil('tr').parent()[0].id.split('-')[1]); alert('Speicheeeern von Aufgabe #'+id+' !'); });