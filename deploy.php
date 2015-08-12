<?php 
	echo `git add . --all 2>&1`; 
	$stamp = date('d.m.Y') . ' at ' . date('h:m') . ' and ' . date('s') . ' seconds';
	echo shell_exec('git commit -m "file changed on ' . $stamp . '" 2>&1'); 
	echo `git push https://danborufka:g1t579#0a@github.com/danborufka/danborufka.github.io.git 2>&1`; 
?>