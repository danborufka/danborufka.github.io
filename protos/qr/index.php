<?php 

	global $first_time;
	global $wrong_month;

	$ALLOWED_MONTHS = [7, 8,9,10,11,12];
	$TOTAL_STAMPS_NEEDED = 4;

	session_start();


	if(isset($_GET['reset'])) {
		unset($_SESSION['user_visited']);
		unset($_SESSION['user_email']);
	}

	$wrong_month = !in_array(intval(date('n')), $ALLOWED_MONTHS);

	if(!$wrong_month) {
		setlocale(LC_TIME, "de_DE");
		$date = strftime('%B %Y');

		if(isset($_GET['user_email'])) {
			$_SESSION['user_email'] = $_GET['user_email'];
		} else {
			$_SESSION['user_visited'] = intval($_SESSION['user_visited']) + 1;
		}

		$remaining_stamps = $TOTAL_STAMPS_NEEDED - $_SESSION['user_visited'];
		$first_time = !isset($_SESSION['user_email']);
	}
?><!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>La Creperie – Stempelkarte</title>
		<link rel="stylesheet" type="text/css" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
		<link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet">
		<style type="text/css">
			body {
				background: #840002;
				color: #fff;
				font-family: 'Lato', sans-serif;
				font-size: 16px;
			}
			.btn {
				background: #fff;
				border-radius: 0;
				color: #840002;
				opacity: .8;
				padding-bottom: 20px;
				padding-top: 20px;
				width: 100%;
			}
			.btn:hover {
				opacity: 1;
			}
			h1 {
				font-size: 82px;
				margin-bottom: 0;
			}
			p, p *, h1, h2, h3, h4 {
				text-align: center;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="row">
				<div class="col-xs-9 col-xs-offset-2 col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3">
					<img src="img/logo.jpg" width="100%" style="margin-left:-20px;">
				<?php if($wrong_month): ?>
					<p>Stempel nicht in diesem Monat einlösbar!</p>
				<?php elseif($first_time): ?>
					<form class="form-group" action="?">
						<label for="user_email">E-Mail Adresse:</label>
						<input class="form-control" type="email" id="user_email" name="user_email"></input>
						<br>
						<input type="submit" class="btn" value="Speichern!">
					</form>
				<?php elseif($remaining_stamps > 0): ?>
					<p><b>Eingetragen!</b></p>
					<h1 class="count"><?php echo $remaining_stamps; ?></h1> 
					<p>Stempel noch.</p>
				<?php else: ?>
					<p>Sommerplatz gesichert! Vielen Dank.</p>
				<?php endif; ?>
				</div>
			</div>
		</div>
		<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
		<script type="text/javascript" src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
		<script type="text/javascript">
			jQuery(function($) {

			});
		</script>
	</body>
</html>