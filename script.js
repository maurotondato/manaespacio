$(document).ready(function() {
    // Testimonios carousel
    let currentIndex = 0;
    const testimonials = $('.testimonial');
    testimonials.slice(1).hide();

    setInterval(function() {
        testimonials.eq(currentIndex).fadeOut(400, function() {
            $(this).css('display', 'none');
            currentIndex = (currentIndex + 1) % testimonials.length;
            testimonials.eq(currentIndex).fadeIn();
        });
    }, 5000);

    // Cambiar el color del header al hacer scroll por las secciones especificadas
    $(window).scroll(function() {
        var scrollPos = $(window).scrollTop();
        var acercaOffset = $('#acerca').offset().top - 200;
        var terapiasOffset = $('#terapias').offset().top - 200;
        var testimoniosOffset = $('#testimonios').offset().top - 200;
        var contactoOffset = $('#contacto').offset().top - 200;

        if ((scrollPos >= acercaOffset && scrollPos < terapiasOffset) ||
            (scrollPos >= terapiasOffset && scrollPos < testimoniosOffset) ||
            (scrollPos >= testimoniosOffset && scrollPos < contactoOffset) ||
            (scrollPos >= contactoOffset)) {
            $('header').addClass('highlighted');
        } else {
            $('header').removeClass('highlighted');
        }

        // Agregar clase 'scrolled' para cambiar el estilo al hacer scroll
        if (scrollPos > 50) {
            $('header').addClass('scrolled');
        } else {
            $('header').removeClass('scrolled');
        }

        // Activar animaciones al desplazarse, excepto para el feed de Instagram
        activateAnimations();
    });

    // Manejar el cambio de menú
    $('.menu-toggle').click(function() {
        $('nav ul').toggleClass('showing');
    });

    // Activar animaciones al cargar la página, excepto para el feed de Instagram
    activateAnimations();
});

document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        card.addEventListener("click", function () {
            const isHovered = this.classList.contains("hover");
            cards.forEach(c => c.classList.remove("hover"));
            if (!isHovered) {
                this.classList.add("hover");
            }
        });
    });
    
    // Remove hover class when clicking outside the cards
    document.addEventListener("click", function(event) {
        if (!event.target.closest(".card")) {
            cards.forEach(card => card.classList.remove("hover"));
        }
    });

    // Make the social buttons visible with a slide-in effect
    const socialButtons = document.querySelector('.social-buttons');
    setTimeout(() => {
        socialButtons.classList.add('visible');
    }, 500); // Delay to start the animation after page load

    // Add additional animation on hover
    const buttons = document.querySelectorAll('.social-button');
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.animation = 'bounce 0.5s ease';
        });
        button.addEventListener('animationend', () => {
            button.style.animation = '';
        });
    });

    // Change order of elements in the "acerca" section on small screens
    cambiarOrden();
    window.addEventListener('resize', cambiarOrden);
});

// Función para activar animaciones
function activateAnimations() {
    $('section').each(function() {
        // No aplicar animaciones al div de Instagram
        if ($(this).attr('id') === 'instagram') {
            return;
        }

        var elementOffset = $(this).offset().top;
        var scrollPos = $(window).scrollTop() + $(window).height();
        var sectionHeight = $(this).outerHeight();

        if (scrollPos > elementOffset && $(window).scrollTop() < elementOffset + sectionHeight) {
            $(this).find('h1, h2').addClass('animated fade-in-up');
            $(this).find('div, p, img, iframe').addClass('animated scale-in');
        } else {
            // Remover clases para permitir reactivar animaciones al volver a la sección
            $(this).find('h1, h2').removeClass('animated fade-in-up');
            $(this).find('div, p, img, iframe').removeClass('animated scale-in');
        }
    });

    // Activar animación solo en el título de la sección de Instagram
    var instagramOffset = $('#instagram').offset().top;
    var scrollPos = $(window).scrollTop() + $(window).height();
    if (scrollPos > instagramOffset) {
        $('#instagram h2').addClass('animated fade-in-up');
    } else {
        $('#instagram h2').removeClass('animated fade-in-up');
    }
}

// Función para cambiar el orden de los elementos en la sección "acerca" en pantallas pequeñas
function cambiarOrden() {
    const acercaContent = document.querySelector('.acerca-content');
    const h3Element = document.querySelector('.holacursiva');
    const imgElement = document.querySelector('.acerca-content img');

    if (window.innerWidth <= 1100) {
        acercaContent.insertBefore(h3Element, imgElement.nextSibling);
    } else {
        // Restaurar el orden original si el ancho de la pantalla es mayor que 600px
        document.querySelector('#acerca').insertBefore(h3Element, acercaContent);
    }
}

// Keyframes for bounce effect
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-15px);
    }
    60% {
        transform: translateY(-10px);
    }
}`;
document.head.appendChild(styleSheet);
