// /src/routes/formRoutes.ts
import { Router } from "express";
import { FormController } from "../controller/formController";
import { FormFieldController } from "../controller/formFieldController";
import { FormSubmissionController } from "../controller/formSubmissionController";
import catchAsync from "../utils/catchAsync";
import { protect } from "../middleware/auth";
import upload from "../utils/upload";

const router = Router();

// Form routes
router.post("/", protect, catchAsync(FormController.createForm));
router.get("/", protect, catchAsync(FormController.getForms));
// router.get("/public", catchAsync(FormController.getPublicForms));
router.get("/:id", protect, catchAsync(FormController.getFormById));
router.put("/:id", protect, catchAsync(FormController.updateForm));
router.delete("/:id", protect, catchAsync(FormController.deleteForm));
// router.patch("/:id/publish", protect, catchAsync(FormController.publishForm));
// router.patch("/:id/unpublish", protect, catchAsync(FormController.unpublishForm));

// Form field routes
router.post(
  "/:formId/fields",
  protect,
  catchAsync(FormFieldController.createFormField)
);
router.get(
  "/:formId/fields",
  protect,
  catchAsync(FormFieldController.getFormFields)
);
router.get(
  "/fields/:id",
  protect,
  catchAsync(FormFieldController.getFormFieldById)
);
router.put(
  "/fields/:id",
  protect,
  catchAsync(FormFieldController.updateFormField)
);
router.delete(
  "/fields/:id",
  protect,
  catchAsync(FormFieldController.deleteFormField)
);
router.patch(
  "/:formId/fields/reorder",
  protect,
  catchAsync(FormFieldController.reorderFormFields)
);

// Form submission routes
router.post(
  "/:formId/submit",
  upload.array("files", 10), // Allow up to 10 files
  catchAsync(FormSubmissionController.submitForm)
);
router.get(
  "/:formId/submissions",
  protect,
  catchAsync(FormSubmissionController.getFormSubmissions)
);
router.get(
  "/submissions/:id",
  protect,
  catchAsync(FormSubmissionController.getSubmissionById)
);
router.delete(
  "/submissions/:id",
  protect,
  catchAsync(FormSubmissionController.deleteSubmission)
);
router.get(
  "/:formId/submissions/export",
  protect,
  catchAsync(FormSubmissionController.exportSubmissions)
);
router.get(
  "/:formId/submissions/stats",
  protect,
  catchAsync(FormSubmissionController.getSubmissionStats)
);

export default router;
