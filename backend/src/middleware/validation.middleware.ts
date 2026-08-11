import type { Request, Response, NextFunction } from "express";

type ValidatorFn = (body: Record<string, unknown>) => Record<string, string>;

export function validate(validatorFn: ValidatorFn) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validatorFn(req.body as Record<string, unknown>);

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ success: false, message: "Validation failed", errors });
      return;
    }

    next();
  };
}
