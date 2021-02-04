import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
    'pk_test_51IGXMPGOW8RjckFUdObARCPMOnLpYyJudRkc71SrlTsNYEm4dYdDR3VwjB8munMFLXjXo5ZrlnIIgHv5CmwDPrUN00lJRIGUNf'
);

export const bookTour = async (id) => {
    try {
        // Get checkout session from the server
        const session = await axios.get(
            `http://localhost:3000/api/v1/bookings/checkout-session/${id}`
        );

        // Use Stripe object to get checkout form and charge card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });
    } catch (error) {
        console.log(error);
        showAlert('error', error.message);
    }
};
