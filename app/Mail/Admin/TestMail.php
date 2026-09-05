<?php

namespace App\Mail\Admin;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly User $recipient) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'RankBeacon Test Email',
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'mail.admin.test',
        );
    }
}
