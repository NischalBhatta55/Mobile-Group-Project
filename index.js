const domainUrl = "http://localhost:3000";

$(document).ready(function () {
    const debug = true;

    // ------------------ Login ------------------
    $('#loginButton').click(function () {
        localStorage.removeItem("inputData");
        $("#loginForm").submit();

        if (localStorage.inputData != null) {
            const inputData = JSON.parse(localStorage.getItem("inputData"));

            $.post(domainUrl + "/verifyUser", inputData, function (data) {
                if (data.length > 0) {
                    localStorage.setItem("userInfo", JSON.stringify(data[0]));
                    $("body").pagecontainer("change", "#homePage");
                } else {
                    alert("Login failed");
                }
                $("#loginForm").trigger('reset');
            });
        }
    });

    $("#loginForm").validate({
        submitHandler: function (form) {
            const formData = $(form).serializeArray();
            const inputData = {};
            formData.forEach(field => inputData[field.name] = field.value);
            localStorage.setItem("inputData", JSON.stringify(inputData));
        },
        rules: {
            email: { required: true, email: true },
            password: { required: true, minlength: 4 }
        }
    });

    // ------------------ Sign Up ------------------
    $('#signupButton').click(function () {
        localStorage.removeItem("signupData");
        $("#signupForm").submit();

        if (localStorage.signupData != null) {
            const signupData = JSON.parse(localStorage.getItem("signupData"));
            $.get(domainUrl + "/checkEmail?email=" + signupData.email, function (data) {
                if (data.exists) {
                    alert("Email already registered");
                } else {
                    $.post(domainUrl + "/registerUser", signupData, function () {
                        alert("Registration successful");
                        localStorage.setItem("userInfo", JSON.stringify(signupData));
                        $("body").pagecontainer("change", "#homePage");
                        $("#signupForm").trigger('reset');
                    });
                }
            });
        }
    });

    $("#signupForm").validate({
        submitHandler: function (form) {
            const formData = $(form).serializeArray();
            const inputData = {};
            formData.forEach(field => inputData[field.name] = field.value);
            localStorage.setItem("signupData", JSON.stringify(inputData));
        }
    });

    // ------------------ Confirm Booking ------------------
    $('#confirmBookingButton').click(function () {
        localStorage.removeItem("inputData");
        $("#bookingForm").submit();

        if (localStorage.inputData != null) {
            const bookingInfo = JSON.parse(localStorage.getItem("inputData"));
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));

            bookingInfo.customerEmail = userInfo.email;
            bookingInfo.bookingNo = Math.floor(Math.random() * 900000 + 100000);

            localStorage.setItem("bookingInfo", JSON.stringify(bookingInfo));

            $.post(domainUrl + "/postBookingData", bookingInfo, function () {
                $("#bookingForm").trigger('reset');
                $("body").pagecontainer("change", "#bookingConfirmationPage");
            });
        }
    });

    $("#bookingForm").validate({
        submitHandler: function (form) {
            const formData = $(form).serializeArray();
            const inputData = {};
            formData.forEach(field => inputData[field.name] = field.value);
            localStorage.setItem("inputData", JSON.stringify(inputData));
        }
    });

    // ------------------ Show Booking Confirmation ------------------
    $(document).on("pagebeforeshow", "#bookingConfirmationPage", function () {
        const booking = JSON.parse(localStorage.getItem("bookingInfo"));
        if (!booking) return;

        $('#orderInfo').html(`
            <table><tbody>
                <tr><td><b>Booking No:</b></td><td>${booking.bookingNo}</td></tr>
                <tr><td><b>Email:</b></td><td>${booking.customerEmail}</td></tr>
                <tr><td><b>Airline:</b></td><td>${booking.airline}</td></tr>
                <tr><td><b>From:</b></td><td>${booking.fromAirport}</td></tr>
                <tr><td><b>To:</b></td><td>${booking.toAirport}</td></tr>
                <tr><td><b>Departure:</b></td><td>${booking.departureDate}</td></tr>
                <tr><td><b>Arrival:</b></td><td>${booking.arrivalDate}</td></tr>
                <tr><td><b>Name:</b></td><td>${booking.firstName} ${booking.lastName}</td></tr>
                <tr><td><b>Phone:</b></td><td>${booking.phoneNumber}</td></tr>
                <tr><td><b>Address:</b></td><td>${booking.address}, ${booking.postcode}</td></tr>
            </tbody></table>
        `);
    });

    // ------------------ Load Past Bookings ------------------
    $(document).on("pagebeforeshow", "#flightHistoryPage", function () {
        const email = JSON.parse(localStorage.getItem("userInfo")).email;
        $('#pastBookingsList').html("");

        $.get(domainUrl + "/getUserBookings?email=" + email, function (data) {
            if (data.length > 0) {
                data.forEach(booking => {
                    $('#pastBookingsList').append(`
                        <div class="booking-card" data-booking-no="${booking.bookingNo}" style="border:1px solid #ccc; padding:15px; margin-bottom:15px; border-radius:6px; background:#f9f9f9;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="width: 80%;">
                            <p><b>Booking No:</b> ${booking.bookingNo}</p>
                            <p><b>Airline:</b> ${booking.airline}</p>
                            <p><b>From:</b> ${booking.fromAirport}</p>
                            <p><b>To:</b> ${booking.toAirport}</p>
                            <p><b>Departure:</b> ${booking.departureDate}</p>
                            <p><b>Arrival:</b> ${booking.arrivalDate}</p>
                        </div>
            </div>
        </div>
                    `);
                });
            } else {
                $('#pastBookingsList').append('<p>No bookings found.</p>');
            }
        });
    });

      // ------------------ Search Bookings ------------------

    $('#searchBookingBtn').click(function () {
    const bookingNo = $('#searchBookingNo').val();
    const email = JSON.parse(localStorage.getItem("userInfo")).email;

    $('#searchResultContainer').html("");

    if (!bookingNo) {
        alert("Please enter a booking number.");
        return;
    }

    $.get(`${domainUrl}/getUserBookings?email=${email}`, function (data) {
        const match = data.find(b => b.bookingNo == bookingNo);
        if (match) {
            renderSearchResultCard(match);
        } else {
            $('#searchResultContainer').html('<p>No booking found with that number.</p>');
        }
    });
});

function renderSearchResultCard(booking) {
    $('#searchResultContainer').append(`
        <div class="booking-card" data-booking-no="${booking.bookingNo}" style="border:1px solid #ccc; padding:15px; margin-bottom:15px; border-radius:6px; background:#f9f9f9;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="width: 80%;">
                    <p><b>Booking No:</b> ${booking.bookingNo}</p>
                    <p><b>Airline:</b> ${booking.airline}</p>
                    <p><b>From:</b> ${booking.fromAirport}</p>
                    <p><b>To:</b> ${booking.toAirport}</p>
                    <p><b>Departure:</b> ${booking.departureDate}</p>
                    <p><b>Arrival:</b> ${booking.arrivalDate}</p>
                </div>
                <div style="text-align: right;">
                    <a href="#" class="delete-booking-btn ui-btn ui-btn-inline ui-btn-d"; >Delete</a>
                </div>
            </div>
        </div>
    `);
}
$(document).on('click', '.delete-booking-btn', function () {
    const card = $(this).closest('.booking-card');
    const bookingNo = card.data('booking-no');

    if (confirm(`Delete booking #${bookingNo}?`)) {
        fetch(domainUrl + "/deleteSingleBooking", {
            method: "POST", // ✅ USE POST instead of DELETE
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ bookingNo: parseInt(bookingNo) })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(`Booking #${bookingNo} deleted.`);
                card.remove(); // ✅ Remove from UI
            } else {
                alert("Booking not found or couldn't be deleted.");
            }
        })
        .catch(err => {
            console.error("Delete error:", err);
            alert("Something went wrong while deleting.");
        });
    }
});



    // ------------------ Delete All Bookings ------------------
    $('#deleteBookingsBtn').click(function () {
        const email = JSON.parse(localStorage.getItem("userInfo")).email;
        if (confirm("Are you sure you want to delete all bookings?")) {
            $.ajax({
                url: domainUrl + "/deleteUserBookings",
                type: "DELETE",
                contentType: "application/json",
                data: JSON.stringify({ email }),
                success: function (res) {
                    $('#deleteConfirmationMessage').html(`<h3>${res.count} booking(s) deleted</h3>`);
                    $("body").pagecontainer("change", "#deleteConfirmationPage");
                }
            });
        }
    });
});
