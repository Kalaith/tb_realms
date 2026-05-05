<?php

declare(strict_types=1);

namespace App\Models;

use ArrayAccess;
use JsonSerializable;

/**
 * @implements ArrayAccess<string, mixed>
 */
abstract class Record implements ArrayAccess, JsonSerializable
{
    /**
     * @param array<string, mixed> $attributes
     */
    public function __construct(protected array $attributes = [])
    {
    }

    /**
     * @param array<string, mixed> $attributes
     */
    public static function fromArray(array $attributes): static
    {
        return new static($attributes);
    }

    public function __get(string $name): mixed
    {
        $value = $this->attributes[$name] ?? null;

        if ($value === null || $value instanceof DateValue) {
            return $value;
        }

        if (is_string($value) && $value !== '' && $this->isDateColumn($name)) {
            return new DateValue($value);
        }

        return $value;
    }

    public function __isset(string $name): bool
    {
        return array_key_exists($name, $this->attributes);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return $this->attributes;
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return $this->attributes;
    }

    public function offsetExists(mixed $offset): bool
    {
        return is_string($offset) && array_key_exists($offset, $this->attributes);
    }

    public function offsetGet(mixed $offset): mixed
    {
        return is_string($offset) ? ($this->attributes[$offset] ?? null) : null;
    }

    public function offsetSet(mixed $offset, mixed $value): void
    {
        if (is_string($offset)) {
            $this->attributes[$offset] = $value;
        }
    }

    public function offsetUnset(mixed $offset): void
    {
        if (is_string($offset)) {
            unset($this->attributes[$offset]);
        }
    }

    private function isDateColumn(string $name): bool
    {
        return str_ends_with($name, '_at') || in_array($name, ['last_updated'], true);
    }
}
