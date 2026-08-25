extends Node

func _ready() -> void:
	var args := OS.get_cmdline_user_args()
	if args.is_empty():
		_fail("No scene path was supplied to the TSCN preview launcher.")
		return

	var scene_path := args[0]
	if not scene_path.begins_with("res://") or not scene_path.ends_with(".tscn") or ".." in scene_path:
		_fail("Invalid scene path: %s" % scene_path)
		return

	var packed := load(scene_path) as PackedScene
	if not packed:
		_fail("Could not load scene: %s" % scene_path)
		return

	var instance := packed.instantiate()
	add_child(instance)
	print("TSCN_PREVIEW_READY:%s" % scene_path)


func _fail(message: String) -> void:
	push_error(message)
	print("TSCN_PREVIEW_ERROR:%s" % message)
