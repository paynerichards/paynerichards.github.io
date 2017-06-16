var deck;
var newDeck = function(){
	$.ajax({
		method:"GET",
		url: "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6",
		success: function(response){
			deck = response.deck_id
			console.log(response.deck_id)
		}
	})
}

newDeck();

var gambler = {
	name: 'Player',
	hand: [],
	score: 0,
	handDisplay: $('.gamblerCards'),
	valueDisplay: $('.countGam'),
	wins: 0,
	stand: false,
	over: false
}

var gamSplit = {
	name: "split",
	hand: [],
	score: 0,
	handDisplay: $('.splitCards'),
	valueDisplay: $('.countSplit'),
	toggle: false,
	over: false
}

var dealer = {
	name: 'Dealer',
	hand: [],
	score: 0,
	handDisplay: $('.dealerCards'),
	valueDisplay: $('.countDeal'),
	wins: 0,
	secondCard: false
}

var gameOver = false;

var remain;

var winner;
var loser;

var newCards = function(player, amount){
	$.ajax({
		method:"GET",
		url: "https://deckofcardsapi.com/api/deck/" + deck + "/draw/?count=" + amount,
		success: function(response){
			for(var i = 0; i < amount; i++){
				player.hand.push(response.cards[i])
				remain = response.remaining
				player.handDisplay.append('<img class="card" src="' + response.cards[i].image + '">')
			}
			tallyScore(player);
			emptyDeck();
			if(gambler.score >= 21 || dealer.score >= 21){
				checkWin();
			}
			else if( (dealer.score >= 17) && gambler.stand === true){
				checkWin();
			}
			hideCard();			
		}
	})
}

var emptyDeck = function(){
	if(remain < 4){
		newDeck()
	}
}


var tallyScore = function(player){
	player.score = 0
	for(var i = 0; i < player.hand.length; i++) {
		var val = player.hand[i].value
		if(val === "JACK" || val === "KING" || val === "QUEEN"){
			player.hand[i].value = "10"
			player.score = player.score + 10
		}
		else if (val != 'ACE') player.score += Number(val)
			
	}
	for(var i = 0; i < player.hand.length; i++){
		var val = player.hand[i].value;
		if(val === 'ACE'){
			if(player.score <= 10){
				player.score = player.score + 11
			}else if(player.score > 10){
				player.score = player.score + 1
			}
		}
	}
	console.log(player.name + " score: " + player.score)
	gambler.valueDisplay.css('display', 'inherit')
	valDisplay(player)
}

var checkWin = function(){
	if(gambler.score > 21 || (dealer.score > gambler.score && dealer.score <= 21) && gameOver === false){
		console.log('dealer Win');
		dealer.wins++
		winner = dealer;
		loser = gambler;
		$('#dealerScore').text('Dealer: ' + dealer.wins)
		gameOver = true;
	}else if(dealer.score > 21 || (gambler.score >= dealer.score && gambler.score <= 21) && gameOver === false){
		console.log('gambler Win');
		gambler.wins++
		$('#gamblerScore').text('Player: ' + gambler.wins)
		winner = gambler;
		loser = dealer;
		gameOver = true;
	}
	dealer.valueDisplay.css('display', 'inherit')
	winDisplay()
}

var newRound = function(){
	dealer.hand = [];
	gambler.hand = [];
	gamSplit.hand = [];
	dealer.score = 0;
	gambler.score = 0;
	gamSplit.score = 0;
	newCards(gambler, 2);
	newCards(dealer, 2);
	gambler.stand = false;
	gamSplit.toggle = false;
	gameOver = false;
	gamSplit.valueDisplay.hide();
	dealer.valueDisplay.hide();
	$('.winScreen').remove();
}

var hideCard = function(){
	if(dealer.hand.length === 2 && gambler.hand.length === 2 && gameOver === false && gamSplit.toggle === false ){
		$($('.card')[1]).hide()
		dealer.handDisplay.append('<img id="hiddenCard" src="media/cardBack.jpg">')
	}else if(dealer.hand.length === 2 && gameOver === false){
		$($('.card')[1]).hide()		
	}
	else{
		$('#hiddenCard').remove()
		$($('.card')[1]).show()
		valDisplay(dealer)

	}
}

var valDisplay = function(player){
	player.valueDisplay.text('Value: ' + player.score)
}

var winDisplay = function(){
	$('body').append('<div class="winScreen"><div class="winText">' + winner.name +' Wins!</div><div class="reason"></div></div>')
	if(winner.score === 21 && winner.hand.length === 2){
		$('.reason').text('Blackjack!')
	}
	else if(loser.score > 21){
		$('.reason').text(loser.name + ' busts')
	}
	else if(winner.score > loser.score){
		$('.reason').text(winner.name + ' has higher score')
	}
	else if(winner.score === loser.score){
		$('.reason').text("Push")
	}

}


$('#dealBtn').click(function(){
	if(gambler.hand.length === 0 && dealer.hand.length === 0){
		console.log('deal')	
		newRound();
	}else if(gameOver === true){
		$('.card').remove()
		console.log('deal')
		newRound();
		gameOver = false;
	}	
})


$('#hitBtn').click(function(){	
	if(gambler.hand.length >= 2 && gambler.score < 21 && dealer.score < 21 && gameOver === false && gambler.stand === false){
		console.log('hit');
		newCards(gambler, 1);
	}
})

$('#standBtn').click(function(){
	if(dealer.score < 17 && gambler.score <= 21 && gameOver === false){
		console.log('stand');
		newCards(dealer, 1);
		// do {
		// 	newCards(dealer, 1);
		// 	debugger;
		// } while(dealer.score < 17)

		// while(dealer.score < 17){
		// 	newCards(dealer, 1)
		// 	debugger;
		// }		
	}
	else if(gameOver === false){
		console.log('stand');
		checkWin()
		hideCard()
	}
	gambler.stand = true;
	dealer.valueDisplay.css('display', 'inherit')
})

$('#splitBtn').click(function(){
	if(gambler.hand[0].value === gambler.hand[1].value){
		gamSplit.toggle = true
		console.log('split')
		gamSplit.hand.push(gambler.hand[1]);
		gambler.hand.pop();
		$('.splitCards').append($('.card')[3])
		newCards(gamSplit, 1)
		newCards(gambler, 1)
		gamSplit.valueDisplay.css("display", "inherit");		
	}
})

