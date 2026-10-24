export const juegosDisponibles = [
    {
        id: "ruleta",
        nombre: "Ruleta", //quien le puso europea?? XD
        minBet: 1000,
        maxBet: 500000,
        regla: "Elige un número o color (Rojo/Negro). Multiplicador x2.",
        imagen: "images/ruleta.jpg"
    },
    {
        id: "blackjack",
        nombre: "Blackjack",
        minBet: 1000,
        maxBet: 750000,
        regla: "El número más cercano a 21 sin pasarse de la casa.",
        imagen: "images/Blackjack.jpg"
    },
    {
        id: "slots",
        nombre: "Slots Nova",
        minBet: 5000,
        maxBet: 300000,
        regla: "Combina símbolos para obtener ganancias multiplicadas.",
        imagen: "images/slots.jpg"
    },
    {
        id: "dino", //hay q cambiarlo por el dino
        nombre: "Dino",
        minBet: 2500,
        maxBet: 600000,
        regla: "Detén el vuelo antes de que choque para cobrar.",
        imagen: "images/aviator.webp"
    }
];