<?php

declare(strict_types=1);

namespace App\Models;

use DateTimeImmutable;
use DateTimeInterface;

final class DateValue
{
    private DateTimeImmutable $date;

    public function __construct(string $value)
    {
        $this->date = new DateTimeImmutable($value);
    }

    public function toISOString(): string
    {
        return $this->date->format(DateTimeInterface::ATOM);
    }

    public function toDateString(): string
    {
        return $this->date->format('Y-m-d');
    }

    public function format(string $format): string
    {
        return $this->date->format($format);
    }

    public function __toString(): string
    {
        return $this->date->format('Y-m-d H:i:s');
    }
}
