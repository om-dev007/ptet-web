# Study Materials Schema

## Table Name

study_materials

## Fields

| Field | Type | Description |
|---------|---------|---------|
| id | UUID | Unique identifier |
| title | STRING | Study material title |
| description | TEXT | Material description |
| type | ENUM | article, video, tip |
| skill | ENUM | speaking, writing, reading, listening |
| content_url | TEXT | URL to resource |
| is_premium | BOOLEAN | Premium access flag |
| created_at | DATE | Record creation timestamp |

## Purpose

Stores study resources available to users for PTE preparation.

## Supported Types

- article
- video
- tip

## Supported Skills

- speaking
- writing
- reading
- listening