# Abstract




# Plan
> Available Roles - {`user`, `events_manager`, `admin`}

# For unauthenticated users:

> Navigation and Pages

--> Left:
- Title and logo

--> Center:
- Home
- Events
- Upcoming Events
- Contact Us

--> Right:
- Login
- Dark/Light mode Toggle

> Role - `null`



# For Authenticated users (non-staff):

> Navigation and Pages:

--> Left:
- Title and logo

--> Center:
- Dashboard
- Events
- Upcoming Events
- Contact Us

--> Right:
- Login
- Dark/Light mode Toggle

> Role - `user`



# FLOW:

A user can create an account on the platform, 
they can navigate over the available events,
they can choose an event,
probably go into with `Read More` button,
they can register it with `Register` button,
registration will be successful on payment,
on success, through some webhook or whatever, we will store the payment details in the database for legal purposes whatever..
Lets use resend to send an email acknowledgement to the registered email
When it comes to registration, the 